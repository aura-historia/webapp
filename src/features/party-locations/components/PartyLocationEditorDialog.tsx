import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useMemo, useState } from "react";
import { type UseFormReturn, useController, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AdminSelect } from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    ADMIN_LEGEND_CLASS,
    ADMIN_SMALL_DANGER_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import {
    getSubdivisionCountry,
    listCountryCodes,
    listSubdivisionCodes,
    parseCountryCode,
    parseSubdivisionCode,
} from "@/data/internal/geography/GeographicCodes.ts";
import { GEOGRAPHIC_PRECISIONS } from "@/data/internal/geography/GeographicPosition.ts";
import {
    type CreatePartyLocationInput,
    PARTY_LOCATION_EVIDENCE_SCOPES,
    PARTY_LOCATION_ROLES,
    type PartyLocation,
} from "@/data/internal/geography/PartyLocation.ts";
import { GeographyDisclosure } from "@/features/geography/components/GeographyDisclosure.tsx";
import { formatCountryName } from "@/features/geography/lib/formatGeography.ts";
import { cn, handleCheckedChange } from "@/lib/utils.ts";
import {
    type PartyLocationReconciliation,
    PartyLocationRequestError,
    type PartyLocationScope,
    useCorrectPartyLocation,
    useCreatePartyLocation,
} from "../api/usePartyLocations.ts";
import {
    buildCorrectPartyLocationInput,
    buildCreatePartyLocationInput,
    type PartyLocationFormValues,
    partyLocationFormSchema,
    toPartyLocationFormValues,
    toRelocationFormValues,
} from "../lib/partyLocationForm.ts";
import { formatPartyLocationRegion } from "../lib/partyLocationSummary.ts";
import { PartyLocationConsequence } from "./PartyLocationConsequence.tsx";

export type PartyLocationEditorIntent =
    | { readonly kind: "create" }
    | { readonly kind: "correct" | "relocate"; readonly location: PartyLocation };

const HINT_CLASS = "text-xs leading-normal text-ink-muted";
const NOTE_CLASS = "rounded-md bg-surface-sunken px-3.5 py-3 text-meta leading-normal";
const ALERT_BOX_CLASS =
    "flex flex-col gap-3 rounded-md bg-surface p-4 shadow-[inset_0_0_0_1.5px_var(--oxblood)]";
const DISCLOSURE_ID = "party-location-public-disclosure";

/**
 * Create, same-location correction and relocation of one Party location. Pass a fresh `key` per
 * intent. `current` is the latest authoritative state of the edited location: when it moves past
 * the revision the draft is based on, submission waits for the user to keep or discard the draft
 * explicitly. A create or relocation with an unknown outcome keeps the draft and waits for the
 * refreshed locations before it can be submitted again; it is never resubmitted automatically.
 */
export function PartyLocationEditorDialog({
    scope,
    intent,
    current,
    open,
    onOpenChange,
    onSaved,
}: {
    readonly scope: PartyLocationScope;
    readonly intent: PartyLocationEditorIntent;
    readonly current?: PartyLocation;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onSaved?: (location: PartyLocation) => void;
}) {
    const { t } = useTranslation();
    const existing = intent.kind === "create" ? undefined : intent.location;
    // The location as it was when this draft began; corrections send only changes relative to it.
    const [original, setOriginal] = useState(existing);
    const [baseRevision, setBaseRevision] = useState(existing?.revision);
    const [pendingRelocation, setPendingRelocation] = useState<CreatePartyLocationInput>();
    const [notice, setNotice] = useState<string>();
    const create = useCreatePartyLocation(scope);
    const correct = useCorrectPartyLocation(scope);
    const form = useForm<PartyLocationFormValues>({
        resolver: zodResolver(partyLocationFormSchema),
        defaultValues:
            intent.kind === "relocate"
                ? toRelocationFormValues(intent.location)
                : toPartyLocationFormValues(existing),
    });

    // A successful save also advances the revision; the dialog is closing by then.
    const saved = create.isSuccess || correct.isSuccess;
    const latest = existing && !saved && current?.id === existing.id ? current : undefined;
    const stale = latest !== undefined && latest.revision !== baseRevision;
    const inactive = latest !== undefined && latest.lifecycle !== "ACTIVE";
    const pending = create.isPending || correct.isPending;
    const requestError = intent.kind === "correct" ? correct.error : create.error;
    const indefinite =
        intent.kind !== "correct" &&
        create.error instanceof PartyLocationRequestError &&
        create.error.isIndefinite;
    // Another create is offered only after the authoritative locations were reloaded.
    const unreconciled = indefinite && create.reconciliation.status !== "refreshed";

    const resetFeedback = () => {
        setNotice(undefined);
        setPendingRelocation(undefined);
        create.reset();
        correct.reset();
    };

    const close = () => {
        resetFeedback();
        onOpenChange(false);
    };

    const saveCreated = (input: CreatePartyLocationInput) =>
        create.mutate(input, {
            onSuccess: (location) => {
                toast.success(
                    t(
                        input.relocates
                            ? "partyLocations.success.relocated"
                            : "partyLocations.success.created",
                    ),
                );
                onSaved?.(location);
                onOpenChange(false);
            },
            onError: () => setPendingRelocation(undefined),
        });

    const submit = (values: PartyLocationFormValues) => {
        resetFeedback();
        if (intent.kind === "create") {
            saveCreated(buildCreatePartyLocationInput(values));
            return;
        }
        if (!original || baseRevision === undefined) return;
        if (intent.kind === "relocate") {
            setPendingRelocation(
                buildCreatePartyLocationInput(values, { id: original.id, revision: baseRevision }),
            );
            return;
        }
        const input = buildCorrectPartyLocationInput(values, original, baseRevision);
        if (!input) {
            setNotice(t("partyLocations.editor.noChanges"));
            return;
        }
        correct.mutate(
            { locationId: original.id, input },
            {
                onSuccess: ({ location, unchanged }) => {
                    if (unchanged) toast.info(t("partyLocations.success.unchanged"));
                    else toast.success(t("partyLocations.success.corrected"));
                    onSaved?.(location);
                    onOpenChange(false);
                },
            },
        );
    };

    const keepDraft = () => {
        if (!latest) return;
        resetFeedback();
        setBaseRevision(latest.revision);
    };

    const discardDraft = () => {
        if (!latest) return;
        resetFeedback();
        setOriginal(latest);
        setBaseRevision(latest.revision);
        form.reset(
            intent.kind === "relocate"
                ? toRelocationFormValues(latest)
                : toPartyLocationFormValues(latest),
        );
    };

    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={(next) => (next ? onOpenChange(true) : close())}
            title={t(`partyLocations.editor.${intent.kind}.title`)}
            subtitle={t(`partyLocations.editor.${intent.kind}.description`)}
        >
            <form
                noValidate
                onSubmit={form.handleSubmit(submit)}
                className="flex flex-col gap-6"
                aria-describedby={DISCLOSURE_ID}
            >
                <GeographyDisclosure
                    kind="publicPartyLocation"
                    id={DISCLOSURE_ID}
                    className={NOTE_CLASS}
                />
                {intent.kind !== "create" && <PartyLocationConsequence action={intent.kind} />}
                {intent.kind === "correct" && original?.hasUnsupportedValues && (
                    <p className={NOTE_CLASS}>{t("partyLocations.editor.unsupportedValues")}</p>
                )}
                <PartyLocationFields form={form} disabled={pending} />
                {stale && (
                    <div role="alert" className={ALERT_BOX_CLASS}>
                        <p className="text-sm">
                            {t(
                                inactive
                                    ? "partyLocations.editor.staleInactive"
                                    : `partyLocations.editor.stale.${intent.kind}`,
                            )}
                        </p>
                        {!inactive && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={keepDraft}
                                    className={SMALL_SECONDARY_PILL_CLASS}
                                >
                                    {t("partyLocations.editor.keepDraft")}
                                </button>
                                <button
                                    type="button"
                                    onClick={discardDraft}
                                    className={SMALL_SECONDARY_PILL_CLASS}
                                >
                                    {t("partyLocations.editor.discardDraft")}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {requestError && !stale && (
                    <p role="alert" className="text-meta text-oxblood">
                        {requestError.message}
                    </p>
                )}
                {indefinite && (
                    <ReconciliationStatus
                        reconciliation={create.reconciliation}
                        onRefresh={() => void create.refresh()}
                    />
                )}
                {notice && <output className="text-meta text-ink-secondary">{notice}</output>}
                {pendingRelocation ? (
                    <div className={ALERT_BOX_CLASS}>
                        <p className="text-sm">{t("partyLocations.editor.confirmRelocation")}</p>
                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                disabled={pending}
                                onClick={() => setPendingRelocation(undefined)}
                                className={SMALL_SECONDARY_PILL_CLASS}
                            >
                                {t("partyLocations.actions.back")}
                            </button>
                            <button
                                type="button"
                                disabled={pending || stale || inactive || unreconciled}
                                onClick={() => saveCreated(pendingRelocation)}
                                className={ADMIN_SMALL_DANGER_CLASS}
                            >
                                {pending
                                    ? t("partyLocations.actions.saving")
                                    : t("partyLocations.actions.confirmRelocate")}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col-reverse gap-2.5 border-t border-line-subtle pt-5 sm:flex-row sm:justify-end">
                        <button type="button" onClick={close} className={SECONDARY_PILL_CLASS}>
                            {t("partyLocations.actions.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={pending || stale || inactive || unreconciled}
                            className={PRIMARY_PILL_CLASS}
                        >
                            {pending
                                ? t("partyLocations.actions.saving")
                                : t(`partyLocations.editor.${intent.kind}.submit`)}
                        </button>
                    </div>
                )}
            </form>
        </AdminRecordDialog>
    );
}

/**
 * Progress of the refresh after an unknown create outcome. The refreshed active locations are
 * listed for review without matching them to the draft: equal content cannot prove the original
 * request succeeded.
 */
function ReconciliationStatus({
    reconciliation,
    onRefresh,
}: {
    readonly reconciliation: PartyLocationReconciliation;
    readonly onRefresh: () => void;
}) {
    const { t, i18n } = useTranslation();
    if (reconciliation.status === "refreshing") {
        return (
            <output className="text-meta text-ink-secondary">
                {t("partyLocations.editor.reconciliation.refreshing")}
            </output>
        );
    }
    if (reconciliation.status === "refreshed") {
        const active = reconciliation.locations.filter(
            (location) => location.lifecycle === "ACTIVE",
        );
        return (
            <div className={cn(NOTE_CLASS, "flex flex-col gap-2")}>
                <output>{t("partyLocations.editor.reconciliation.refreshed")}</output>
                {active.length > 0 ? (
                    <ul
                        className="grid gap-1"
                        aria-label={t("partyLocations.editor.reconciliation.activeLocations")}
                    >
                        {active.map((location) => (
                            <li key={location.id}>
                                <span className="font-medium">{location.label}</span>{" "}
                                <span className="text-ink-secondary">
                                    {formatPartyLocationRegion(location, i18n.language, t)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-ink-secondary">
                        {t("partyLocations.editor.reconciliation.noActiveLocations")}
                    </p>
                )}
            </div>
        );
    }
    if (reconciliation.status === "failed") {
        return (
            <div role="alert" className={ALERT_BOX_CLASS}>
                <p className="text-meta">{t("partyLocations.editor.reconciliation.failed")}</p>
                <button
                    type="button"
                    onClick={onRefresh}
                    className={cn(SMALL_SECONDARY_PILL_CLASS, "self-start")}
                >
                    {t("partyLocations.actions.refresh")}
                </button>
            </div>
        );
    }
    return null;
}

function PartyLocationFields({
    form,
    disabled,
}: {
    readonly form: UseFormReturn<PartyLocationFormValues>;
    readonly disabled: boolean;
}) {
    const { t, i18n } = useTranslation();
    const errors = form.formState.errors;
    const errorText = (name: keyof PartyLocationFormValues) => {
        const message = errors[name]?.message;
        return message ? t(message) : undefined;
    };
    const fieldProps = (name: keyof PartyLocationFormValues, id: string) => ({
        id,
        disabled,
        "aria-invalid": Boolean(errors[name]),
        "aria-describedby": errors[name] ? `${id}-error` : undefined,
    });

    const { field: roles } = useController({ control: form.control, name: "roles" });
    const { field: country } = useController({ control: form.control, name: "country" });
    const { field: precision } = useController({ control: form.control, name: "precision" });
    const { field: evidenceScope } = useController({
        control: form.control,
        name: "evidenceScope",
    });
    const subdivision = useWatch({ control: form.control, name: "subdivision" });
    const parsedSubdivision = parseSubdivisionCode(subdivision);
    const subdivisionCountry =
        parseCountryCode(country.value) ??
        (parsedSubdivision ? getSubdivisionCountry(parsedSubdivision) : undefined);

    const countryOptions = useMemo(
        () =>
            listCountryCodes()
                .map((code) => ({ code, name: formatCountryName(code, i18n.language) }))
                .sort((left, right) => left.name.localeCompare(right.name, i18n.language)),
        [i18n.language],
    );
    const subdivisionOptions = subdivisionCountry ? listSubdivisionCodes(subdivisionCountry) : [];

    return (
        <>
            <FormField id="party-location-label" label={t("partyLocations.fields.label")}>
                <input
                    className={FIELD_CLASS}
                    {...fieldProps("label", "party-location-label")}
                    {...form.register("label")}
                />
                <FieldError id="party-location-label" text={errorText("label")} />
            </FormField>

            <fieldset
                className="grid gap-2"
                disabled={disabled}
                aria-describedby="party-location-roles-hint"
            >
                <legend className={ADMIN_LEGEND_CLASS}>{t("partyLocations.fields.roles")}</legend>
                <p id="party-location-roles-hint" className={HINT_CLASS}>
                    {t("partyLocations.hints.roles")}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {PARTY_LOCATION_ROLES.map((role) => (
                        <label
                            key={role}
                            htmlFor={`party-location-role-${role}`}
                            className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md bg-surface px-3 text-sm shadow-[inset_0_0_0_1px_var(--line)] has-checked:shadow-[inset_0_0_0_1.5px_var(--oxblood)] has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass"
                        >
                            <input
                                id={`party-location-role-${role}`}
                                type="checkbox"
                                checked={roles.value.includes(role)}
                                onChange={(event) =>
                                    handleCheckedChange(roles, role, event.target.checked)
                                }
                                className="size-[15px] accent-oxblood"
                            />
                            {t(`partyLocations.roles.${role}`)}
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset
                className="grid gap-4"
                disabled={disabled}
                aria-describedby="party-location-geography-hint"
            >
                <legend className={ADMIN_LEGEND_CLASS}>
                    {t("partyLocations.sections.geography")}
                </legend>
                <p id="party-location-geography-hint" className={HINT_CLASS}>
                    {t("partyLocations.hints.geography")}
                </p>
                <FormField
                    id="party-location-address"
                    label={t("partyLocations.fields.addressText")}
                >
                    <textarea
                        className={cn(FIELD_CLASS, "h-auto py-2.5 leading-normal")}
                        {...fieldProps("addressText", "party-location-address")}
                        rows={3}
                        {...form.register("addressText")}
                    />
                    <FieldError id="party-location-address" text={errorText("addressText")} />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        id="party-location-country"
                        label={t("partyLocations.fields.country")}
                    >
                        <AdminSelect
                            id="party-location-country"
                            value={country.value ?? ""}
                            onChange={(next) => {
                                country.onChange(next);
                                if (
                                    parsedSubdivision &&
                                    next &&
                                    getSubdivisionCountry(parsedSubdivision) !== next
                                ) {
                                    form.setValue("subdivision", "", { shouldDirty: true });
                                }
                            }}
                            disabled={disabled}
                            invalid={Boolean(errors.country)}
                            describedBy={
                                errors.country ? "party-location-country-error" : undefined
                            }
                            options={[
                                { value: "", label: t("partyLocations.fields.notAsserted") },
                                ...countryOptions.map(({ code, name }) => ({
                                    value: code,
                                    label: name,
                                })),
                            ]}
                        />
                        <FieldError id="party-location-country" text={errorText("country")} />
                    </FormField>
                    <FormField
                        id="party-location-subdivision"
                        label={t("partyLocations.fields.subdivision")}
                    >
                        <AdminSelect
                            id="party-location-subdivision"
                            value={subdivision ?? ""}
                            onChange={(next) =>
                                form.setValue("subdivision", next, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })
                            }
                            disabled={disabled || subdivisionOptions.length === 0}
                            invalid={Boolean(errors.subdivision)}
                            describedBy={
                                errors.subdivision ? "party-location-subdivision-error" : undefined
                            }
                            options={[
                                {
                                    value: "",
                                    label: subdivisionCountry
                                        ? t("partyLocations.fields.notAsserted")
                                        : t("partyLocations.hints.chooseCountry"),
                                },
                                ...subdivisionOptions.map((code) => ({ value: code, label: code })),
                            ]}
                        />
                        <FieldError
                            id="party-location-subdivision"
                            text={errorText("subdivision")}
                        />
                    </FormField>
                    <FormField
                        id="party-location-postal"
                        label={t("partyLocations.fields.postalCode")}
                    >
                        <input
                            className={FIELD_CLASS}
                            {...fieldProps("postalCode", "party-location-postal")}
                            {...form.register("postalCode")}
                        />
                        <FieldError id="party-location-postal" text={errorText("postalCode")} />
                    </FormField>
                </div>
            </fieldset>

            <fieldset
                className="grid gap-4"
                disabled={disabled}
                aria-describedby="party-location-position-hint"
            >
                <legend className={ADMIN_LEGEND_CLASS}>
                    {t("partyLocations.sections.position")}
                </legend>
                <p id="party-location-position-hint" className={HINT_CLASS}>
                    {t("partyLocations.hints.position")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        id="party-location-latitude"
                        label={t("partyLocations.fields.latitude")}
                    >
                        <input
                            className={FIELD_CLASS}
                            {...fieldProps("latitude", "party-location-latitude")}
                            inputMode="decimal"
                            {...form.register("latitude")}
                        />
                        <FieldError id="party-location-latitude" text={errorText("latitude")} />
                    </FormField>
                    <FormField
                        id="party-location-longitude"
                        label={t("partyLocations.fields.longitude")}
                    >
                        <input
                            className={FIELD_CLASS}
                            {...fieldProps("longitude", "party-location-longitude")}
                            inputMode="decimal"
                            {...form.register("longitude")}
                        />
                        <FieldError id="party-location-longitude" text={errorText("longitude")} />
                    </FormField>
                    <FormField
                        id="party-location-precision"
                        label={t("partyLocations.fields.precision")}
                    >
                        <AdminSelect
                            id="party-location-precision"
                            value={precision.value ?? ""}
                            onChange={precision.onChange}
                            disabled={disabled}
                            invalid={Boolean(errors.precision)}
                            describedBy={
                                errors.precision ? "party-location-precision-error" : undefined
                            }
                            options={[
                                { value: "", label: t("partyLocations.fields.notAsserted") },
                                ...GEOGRAPHIC_PRECISIONS.map((value) => ({
                                    value,
                                    label: t(`partyLocations.precisions.${value}`),
                                })),
                            ]}
                        />
                        <FieldError id="party-location-precision" text={errorText("precision")} />
                    </FormField>
                    <FormField
                        id="party-location-accuracy"
                        label={t("partyLocations.fields.accuracyMetres")}
                    >
                        <input
                            className={FIELD_CLASS}
                            {...fieldProps("accuracyMetres", "party-location-accuracy")}
                            inputMode="decimal"
                            {...form.register("accuracyMetres")}
                        />
                        <FieldError
                            id="party-location-accuracy"
                            text={errorText("accuracyMetres")}
                        />
                    </FormField>
                </div>
            </fieldset>

            <fieldset
                className="grid gap-4"
                disabled={disabled}
                aria-describedby="party-location-evidence-hint"
            >
                <legend className={ADMIN_LEGEND_CLASS}>
                    {t("partyLocations.sections.evidence")}
                </legend>
                <p id="party-location-evidence-hint" className={HINT_CLASS}>
                    {t("partyLocations.hints.evidence")}
                </p>
                <FormField
                    id="party-location-evidence"
                    label={t("partyLocations.fields.evidenceReference")}
                >
                    <input
                        className={FIELD_CLASS}
                        {...fieldProps("evidenceReference", "party-location-evidence")}
                        {...form.register("evidenceReference")}
                    />
                    <FieldError
                        id="party-location-evidence"
                        text={errorText("evidenceReference")}
                    />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        id="party-location-evidence-scope"
                        label={t("partyLocations.fields.evidenceScope")}
                    >
                        <AdminSelect
                            id="party-location-evidence-scope"
                            value={evidenceScope.value ?? ""}
                            onChange={evidenceScope.onChange}
                            disabled={disabled}
                            invalid={Boolean(errors.evidenceScope)}
                            describedBy={
                                errors.evidenceScope
                                    ? "party-location-evidence-scope-error"
                                    : undefined
                            }
                            options={PARTY_LOCATION_EVIDENCE_SCOPES.map((scope) => ({
                                value: scope,
                                label: t(`partyLocations.evidenceScopes.${scope}`),
                            }))}
                        />
                    </FormField>
                    <FormField
                        id="party-location-observed"
                        label={t("partyLocations.fields.evidenceObservedOn")}
                    >
                        <input
                            className={FIELD_CLASS}
                            {...fieldProps("evidenceObservedOn", "party-location-observed")}
                            type="date"
                            {...form.register("evidenceObservedOn")}
                        />
                        <FieldError
                            id="party-location-observed"
                            text={errorText("evidenceObservedOn")}
                        />
                    </FormField>
                </div>
            </fieldset>
        </>
    );
}

function FormField({
    id,
    label,
    children,
}: {
    readonly id: string;
    readonly label: string;
    readonly children: ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={id} className={FIELD_LABEL_CLASS}>
                {label}
            </label>
            {children}
        </div>
    );
}

function FieldError({ id, text }: { readonly id: string; readonly text?: string }) {
    if (!text) return null;
    return (
        <p id={`${id}-error`} className={FIELD_ERROR_CLASS}>
            {text}
        </p>
    );
}
