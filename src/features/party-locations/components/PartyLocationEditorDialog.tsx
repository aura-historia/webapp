import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useMemo, useState } from "react";
import { type UseFormReturn, useController, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
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
import { handleCheckedChange } from "@/lib/utils.ts";
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

const SELECT_CLASS =
    "h-9 w-full border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50";
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
        <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t(`partyLocations.editor.${intent.kind}.title`)}</DialogTitle>
                    <DialogDescription>
                        {t(`partyLocations.editor.${intent.kind}.description`)}
                    </DialogDescription>
                </DialogHeader>
                <form
                    noValidate
                    onSubmit={form.handleSubmit(submit)}
                    className="grid gap-5"
                    aria-describedby={DISCLOSURE_ID}
                >
                    <GeographyDisclosure
                        kind="publicPartyLocation"
                        id={DISCLOSURE_ID}
                        className="border bg-surface-container-low p-3"
                    />
                    {intent.kind !== "create" && <PartyLocationConsequence action={intent.kind} />}
                    {intent.kind === "correct" && original?.hasUnsupportedValues && (
                        <p className="border border-border bg-surface-container p-3 text-sm">
                            {t("partyLocations.editor.unsupportedValues")}
                        </p>
                    )}
                    <PartyLocationFields form={form} disabled={pending} />
                    {stale && (
                        <div
                            role="alert"
                            className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4"
                        >
                            <p className="text-sm">
                                {t(
                                    inactive
                                        ? "partyLocations.editor.staleInactive"
                                        : `partyLocations.editor.stale.${intent.kind}`,
                                )}
                            </p>
                            {!inactive && (
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" variant="outline" onClick={keepDraft}>
                                        {t("partyLocations.editor.keepDraft")}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={discardDraft}>
                                        {t("partyLocations.editor.discardDraft")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {requestError && !stale && (
                        <p role="alert" className="text-sm text-destructive">
                            {requestError.message}
                        </p>
                    )}
                    {indefinite && (
                        <ReconciliationStatus
                            reconciliation={create.reconciliation}
                            onRefresh={() => void create.refresh()}
                        />
                    )}
                    {notice && <output className="text-sm text-muted-foreground">{notice}</output>}
                    {pendingRelocation ? (
                        <div className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4">
                            <p className="text-sm">
                                {t("partyLocations.editor.confirmRelocation")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={pending || stale || inactive || unreconciled}
                                    onClick={() => saveCreated(pendingRelocation)}
                                >
                                    {pending
                                        ? t("partyLocations.actions.saving")
                                        : t("partyLocations.actions.confirmRelocate")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={pending}
                                    onClick={() => setPendingRelocation(undefined)}
                                >
                                    {t("partyLocations.actions.back")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={close}>
                                {t("partyLocations.actions.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={pending || stale || inactive || unreconciled}
                            >
                                {pending
                                    ? t("partyLocations.actions.saving")
                                    : t(`partyLocations.editor.${intent.kind}.submit`)}
                            </Button>
                        </DialogFooter>
                    )}
                </form>
            </DialogContent>
        </Dialog>
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
            <output className="text-sm text-muted-foreground">
                {t("partyLocations.editor.reconciliation.refreshing")}
            </output>
        );
    }
    if (reconciliation.status === "refreshed") {
        const active = reconciliation.locations.filter(
            (location) => location.lifecycle === "ACTIVE",
        );
        return (
            <div className="grid gap-2 border border-border bg-surface-container p-3 text-sm">
                <output>{t("partyLocations.editor.reconciliation.refreshed")}</output>
                {active.length > 0 ? (
                    <ul
                        className="grid gap-1"
                        aria-label={t("partyLocations.editor.reconciliation.activeLocations")}
                    >
                        {active.map((location) => (
                            <li key={location.id}>
                                <span className="font-medium">{location.label}</span>{" "}
                                <span className="text-muted-foreground">
                                    {formatPartyLocationRegion(location, i18n.language, t)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">
                        {t("partyLocations.editor.reconciliation.noActiveLocations")}
                    </p>
                )}
            </div>
        );
    }
    if (reconciliation.status === "failed") {
        return (
            <div role="alert" className="grid justify-items-start gap-2 text-sm">
                <p>{t("partyLocations.editor.reconciliation.failed")}</p>
                <Button type="button" variant="outline" onClick={onRefresh}>
                    {t("partyLocations.actions.refresh")}
                </Button>
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
                <Input
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
                <legend className="text-sm font-medium">{t("partyLocations.fields.roles")}</legend>
                <p id="party-location-roles-hint" className="text-xs text-muted-foreground">
                    {t("partyLocations.hints.roles")}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                    {PARTY_LOCATION_ROLES.map((role) => (
                        <div key={role} className="flex items-center gap-2">
                            <Checkbox
                                id={`party-location-role-${role}`}
                                checked={roles.value.includes(role)}
                                onCheckedChange={(checked) =>
                                    handleCheckedChange(roles, role, checked)
                                }
                            />
                            <Label htmlFor={`party-location-role-${role}`} className="font-normal">
                                {t(`partyLocations.roles.${role}`)}
                            </Label>
                        </div>
                    ))}
                </div>
            </fieldset>

            <fieldset
                className="grid gap-4"
                disabled={disabled}
                aria-describedby="party-location-geography-hint"
            >
                <legend className="text-sm font-medium">
                    {t("partyLocations.sections.geography")}
                </legend>
                <p id="party-location-geography-hint" className="text-xs text-muted-foreground">
                    {t("partyLocations.hints.geography")}
                </p>
                <FormField
                    id="party-location-address"
                    label={t("partyLocations.fields.addressText")}
                >
                    <Textarea
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
                        <select
                            {...fieldProps("country", "party-location-country")}
                            className={SELECT_CLASS}
                            name={country.name}
                            ref={country.ref}
                            value={country.value}
                            onBlur={country.onBlur}
                            onChange={(event) => {
                                const next = event.target.value;
                                country.onChange(next);
                                if (
                                    parsedSubdivision &&
                                    next &&
                                    getSubdivisionCountry(parsedSubdivision) !== next
                                ) {
                                    form.setValue("subdivision", "", { shouldDirty: true });
                                }
                            }}
                        >
                            <option value="">{t("partyLocations.fields.notAsserted")}</option>
                            {countryOptions.map(({ code, name }) => (
                                <option key={code} value={code}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        <FieldError id="party-location-country" text={errorText("country")} />
                    </FormField>
                    <FormField
                        id="party-location-subdivision"
                        label={t("partyLocations.fields.subdivision")}
                    >
                        <select
                            {...fieldProps("subdivision", "party-location-subdivision")}
                            disabled={disabled || subdivisionOptions.length === 0}
                            className={SELECT_CLASS}
                            {...form.register("subdivision")}
                        >
                            <option value="">
                                {subdivisionCountry
                                    ? t("partyLocations.fields.notAsserted")
                                    : t("partyLocations.hints.chooseCountry")}
                            </option>
                            {subdivisionOptions.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                        <FieldError
                            id="party-location-subdivision"
                            text={errorText("subdivision")}
                        />
                    </FormField>
                    <FormField
                        id="party-location-postal"
                        label={t("partyLocations.fields.postalCode")}
                    >
                        <Input
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
                <legend className="text-sm font-medium">
                    {t("partyLocations.sections.position")}
                </legend>
                <p id="party-location-position-hint" className="text-xs text-muted-foreground">
                    {t("partyLocations.hints.position")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        id="party-location-latitude"
                        label={t("partyLocations.fields.latitude")}
                    >
                        <Input
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
                        <Input
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
                        <select
                            {...fieldProps("precision", "party-location-precision")}
                            className={SELECT_CLASS}
                            {...form.register("precision")}
                        >
                            <option value="">{t("partyLocations.fields.notAsserted")}</option>
                            {GEOGRAPHIC_PRECISIONS.map((precision) => (
                                <option key={precision} value={precision}>
                                    {t(`partyLocations.precisions.${precision}`)}
                                </option>
                            ))}
                        </select>
                        <FieldError id="party-location-precision" text={errorText("precision")} />
                    </FormField>
                    <FormField
                        id="party-location-accuracy"
                        label={t("partyLocations.fields.accuracyMetres")}
                    >
                        <Input
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
                <legend className="text-sm font-medium">
                    {t("partyLocations.sections.evidence")}
                </legend>
                <p id="party-location-evidence-hint" className="text-xs text-muted-foreground">
                    {t("partyLocations.hints.evidence")}
                </p>
                <FormField
                    id="party-location-evidence"
                    label={t("partyLocations.fields.evidenceReference")}
                >
                    <Input
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
                        <select
                            {...fieldProps("evidenceScope", "party-location-evidence-scope")}
                            className={SELECT_CLASS}
                            {...form.register("evidenceScope")}
                        >
                            {PARTY_LOCATION_EVIDENCE_SCOPES.map((scope) => (
                                <option key={scope} value={scope}>
                                    {t(`partyLocations.evidenceScopes.${scope}`)}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField
                        id="party-location-observed"
                        label={t("partyLocations.fields.evidenceObservedOn")}
                    >
                        <Input
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
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
        </div>
    );
}

function FieldError({ id, text }: { readonly id: string; readonly text?: string }) {
    if (!text) return null;
    return (
        <p id={`${id}-error`} className="text-sm text-destructive">
            {text}
        </p>
    );
}
