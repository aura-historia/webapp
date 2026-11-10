import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { SourceLocationDefault } from "@/data/internal/geography/SourceLocationDefault.ts";
import type { AdminListingSourceDetail } from "@/data/internal/listing-source/AdminListingSource.ts";
import { AdminInlineConfirm } from "@/features/admin/common/components/AdminInlineConfirm.tsx";
import {
    AdminMark,
    type AdminMarkTone,
} from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_SECTION_TITLE_CLASS,
    ADMIN_SKELETON_CLASS,
    ADMIN_SMALL_PRIMARY_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
    TEXT_LINK_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import {
    type PartyLocationScope,
    usePartyLocationList,
} from "@/features/party-locations/api/usePartyLocations.ts";
import { PartyLocationSelector } from "@/features/party-locations/components/PartyLocationSelector.tsx";
import { formatPartyLocationRegion } from "@/features/party-locations/lib/partyLocationSummary.ts";
import { cn } from "@/lib/utils.ts";
import {
    type AdminSourceLocationDefaultScope,
    AdminSourceLocationDefaultRequestError,
    useAdminSourceLocationDefault,
    useAssignAdminSourceLocationDefault,
    useChangeAdminSourceLocationDefaultApplicability,
    useClearAdminSourceLocationDefault,
} from "../api/useAdminSourceLocationDefault.ts";
import {
    type ApplicabilityAssertionDraft,
    type ApplicabilityDraft,
    type ApplicabilityDraftErrors,
    diffApplicabilityDraft,
    EMPTY_APPLICABILITY_DRAFT,
    rebaseApplicabilityDraft,
    SOURCE_LOCATION_APPLICABILITIES,
    type SourceLocationApplicability,
    toApplicabilityDraft,
    toAssignedApplicability,
    validateApplicabilityDraft,
} from "../lib/sourceLocationDefaultForm.ts";

type Mode =
    | { readonly kind: "view" }
    | { readonly kind: "assign" | "applicability" | "clear"; readonly base: SourceLocationDefault };

type GeographyEffect = "none" | "inherits" | "noInventory" | "retired" | "unknown";

function geographyEffect(current: SourceLocationDefault): GeographyEffect {
    if (!current.assignment) return "none";
    if (current.eligibility === "RETIRED") return "retired";
    if (current.eligibility !== "ACTIVE") return "unknown";
    return current.assignment.advertisedInventory === undefined ? "noInventory" : "inherits";
}

function statusOf(current: SourceLocationDefault): {
    readonly tone: AdminMarkTone;
    readonly key: "none" | "ACTIVE" | "RETIRED" | "UNKNOWN";
} {
    if (!current.assignment) return { tone: "dashed", key: "none" };
    if (current.eligibility === "ACTIVE") return { tone: "ink", key: "ACTIVE" };
    if (current.eligibility === "RETIRED") return { tone: "muted", key: "RETIRED" };
    return { tone: "hollow", key: "UNKNOWN" };
}

const PANEL_CLASS = "flex flex-col gap-3.5 rounded-md bg-surface p-[18px] shadow-ring";
const FORM_PANEL_CLASS =
    "flex flex-col gap-4 rounded-md bg-surface p-[18px] shadow-[inset_0_0_0_1.5px_var(--ink)]";

/**
 * The listing source's explicit default location (board "Admin · Listing source", section Default
 * location): its state and revision, assignment from the operator's active locations,
 * independent applicability and clearing, all in one panel. Location details come from the
 * operator's Party locations; the default read itself carries only the reference.
 */
export function AdminSourceLocationDefaultSection({
    source,
}: {
    readonly source: AdminListingSourceDetail;
}) {
    const { t } = useTranslation();
    const { user } = useResolvedAuth();
    const titleId = useId();

    return (
        <section
            aria-labelledby={titleId}
            className="flex flex-col gap-3.5 border-t border-line pt-6"
        >
            <h3 id={titleId} className={ADMIN_SECTION_TITLE_CLASS}>
                {t("adminListingSources.locationDefault.title")}
            </h3>
            {user ? (
                <SourceLocationDefaultWorkflow
                    // A changed operator owns other locations; never keep a draft across it.
                    key={`${source.listingSourceId}:${source.operator.partyId}`}
                    scope={{
                        viewerCacheKey: user.userId,
                        listingSourceId: source.listingSourceId,
                        operatorPartyId: source.operator.partyId,
                    }}
                />
            ) : (
                <PanelSkeleton />
            )}
        </section>
    );
}

function PanelSkeleton() {
    const { t } = useTranslation();
    return (
        <div aria-busy="true" className={PANEL_CLASS}>
            <span className={cn(ADMIN_SKELETON_CLASS, "h-2.5 w-1/4")} />
            <span className={cn(ADMIN_SKELETON_CLASS, "h-5 w-1/2 rounded-sm")} />
            <span className={cn(ADMIN_SKELETON_CLASS, "h-3 w-1/3")} />
            <span className={cn(ADMIN_SKELETON_CLASS, "h-10 w-full rounded-sm")} />
            <p role="status" className="sr-only">
                {t("adminListingSources.locationDefault.loading")}
            </p>
        </div>
    );
}

function ErrorRow({
    message,
    onRetry,
}: {
    readonly message: string;
    readonly onRetry?: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3.5 rounded-md bg-surface p-4 shadow-ring"
        >
            <span className="flex gap-2.5 text-sm text-oxblood">
                <TriangleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                    strokeWidth={2}
                />
                {message}
            </span>
            {onRetry && (
                <button type="button" onClick={onRetry} className={SMALL_SECONDARY_PILL_CLASS}>
                    {t("adminCommon.retry")}
                </button>
            )}
        </div>
    );
}

function SourceLocationDefaultWorkflow({
    scope,
}: {
    readonly scope: AdminSourceLocationDefaultScope;
}) {
    const { t } = useTranslation();
    const query = useAdminSourceLocationDefault(scope.listingSourceId);
    const locationScope: PartyLocationScope = {
        viewerCacheKey: scope.viewerCacheKey,
        partyId: scope.operatorPartyId,
    };
    const [mode, setMode] = useState<Mode>({ kind: "view" });
    const accessLost =
        query.error instanceof AdminSourceLocationDefaultRequestError && query.error.isAccessLoss;
    // Lost authority hides previously loaded protected content instead of showing it beside the error.
    const current = accessLost ? undefined : query.data;

    if (!current) {
        if (query.error) {
            return <ErrorRow message={query.error.message} onRetry={() => void query.refetch()} />;
        }
        return <PanelSkeleton />;
    }

    const view = () => setMode({ kind: "view" });

    let workflow: ReactNode;
    if (mode.kind === "assign") {
        workflow = (
            <AssignForm
                scope={scope}
                locationScope={locationScope}
                initialBase={mode.base}
                latest={current}
                onDone={view}
            />
        );
    } else if (mode.kind === "applicability") {
        workflow = (
            <ApplicabilityForm
                scope={scope}
                initialBase={mode.base}
                latest={current}
                onDone={view}
            />
        );
    } else if (mode.kind === "clear") {
        workflow = (
            <ClearConfirmation
                scope={scope}
                initialBase={mode.base}
                latest={current}
                onDone={view}
            />
        );
    } else {
        workflow = (
            <CurrentDefault
                current={current}
                locationScope={locationScope}
                onAssign={() => setMode({ kind: "assign", base: current })}
                onEditApplicability={() => setMode({ kind: "applicability", base: current })}
                onClear={() => setMode({ kind: "clear", base: current })}
            />
        );
    }

    return (
        <>
            {query.error && <ErrorRow message={query.error.message} />}
            {workflow}
            <Link
                to="/$lng/admin/parties/$partyId"
                from="/$lng"
                params={(previous) => ({ ...previous, partyId: scope.operatorPartyId })}
                className={cn(TEXT_LINK_CLASS, "self-start")}
            >
                {t("adminListingSources.locationDefault.links.operator")}
            </Link>
        </>
    );
}

function CurrentDefault({
    current,
    locationScope,
    onAssign,
    onEditApplicability,
    onClear,
}: {
    readonly current: SourceLocationDefault;
    readonly locationScope: PartyLocationScope;
    readonly onAssign: () => void;
    readonly onEditApplicability: () => void;
    readonly onClear: () => void;
}) {
    const { t } = useTranslation();
    const assignment = current.assignment;
    const status = statusOf(current);

    return (
        <div className={PANEL_CLASS}>
            <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
                    <AdminMark tone={status.tone} className="size-2" />
                    {t(`adminListingSources.locationDefault.status.${status.key}`)} ·{" "}
                    {t("adminListingSources.locationDefault.status.revision", {
                        revision: current.revision,
                    })}
                </span>
                {assignment ? (
                    <ReferencedLocation
                        locationId={assignment.partyLocationId}
                        locationScope={locationScope}
                    />
                ) : (
                    <p className="font-serif text-xl">
                        {t("adminListingSources.locationDefault.fields.noDefault")}
                    </p>
                )}
            </div>
            {assignment && (
                <dl className="border-t border-line">
                    {SOURCE_LOCATION_APPLICABILITIES.map((key) => {
                        const reference = assignment[key];
                        return (
                            <div
                                key={key}
                                className="grid grid-cols-1 gap-1 border-b border-line-subtle py-2.5 last:border-b-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-3"
                            >
                                <dt className="text-meta text-ink-secondary">
                                    {t(
                                        `adminListingSources.locationDefault.applicability.${key}.label`,
                                    )}
                                </dt>
                                <dd className="text-meta break-words">
                                    {reference === undefined ? (
                                        <span className="text-ink-muted">
                                            {t("adminListingSources.locationDefault.fields.no")}
                                        </span>
                                    ) : (
                                        <>
                                            {t("adminListingSources.locationDefault.fields.yes")} ·{" "}
                                            <span className="text-ink-secondary">{reference}</span>
                                        </>
                                    )}
                                </dd>
                            </div>
                        );
                    })}
                </dl>
            )}
            <p className="rounded-sm bg-surface-sunken px-3.5 py-3 text-meta leading-normal">
                {t(`adminListingSources.locationDefault.effect.${geographyEffect(current)}`)}
            </p>
            {current.hasUnsupportedValues && (
                <p className="text-meta text-ink-secondary">
                    {t("adminListingSources.locationDefault.unsupportedValues")}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onAssign} className={ADMIN_SMALL_PRIMARY_CLASS}>
                    {t(
                        assignment
                            ? "adminListingSources.locationDefault.actions.replace"
                            : "adminListingSources.locationDefault.actions.assign",
                    )}
                </button>
                {assignment && current.eligibility === "ACTIVE" && (
                    <button
                        type="button"
                        onClick={onEditApplicability}
                        className={SMALL_SECONDARY_PILL_CLASS}
                    >
                        {t("adminListingSources.locationDefault.actions.editApplicability")}
                    </button>
                )}
                {assignment && (
                    <button type="button" onClick={onClear} className={SMALL_SECONDARY_PILL_CLASS}>
                        {t("adminListingSources.locationDefault.actions.clear")}
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Shows the referenced location's label and region only when the operator's loaded locations
 * contain it; otherwise only its ID. The default read never carries location content.
 */
function ReferencedLocation({
    locationId,
    locationScope,
}: {
    readonly locationId: string;
    readonly locationScope: PartyLocationScope;
}) {
    const { t, i18n } = useTranslation();
    const locations = usePartyLocationList(locationScope);
    const location = locations.error
        ? undefined
        : locations.data?.pages
              .flatMap((page) => page.items)
              .find((item) => item.id === locationId);

    return (
        <>
            {location ? (
                <>
                    <p className="font-serif text-xl break-words">{location.label}</p>
                    <p className="text-meta text-ink-secondary">
                        {formatPartyLocationRegion(location, i18n.language, t)}
                    </p>
                </>
            ) : (
                <p className="text-meta text-ink-secondary">
                    {t("adminListingSources.locationDefault.fields.locationUnavailable")}
                </p>
            )}
            <code className="font-mono text-[11px] break-all text-ink-muted">{locationId}</code>
        </>
    );
}

/** A newer revision loaded while a form or confirmation was open: the administrator chooses. */
function StaleBlock({
    message,
    error,
    onDiscard,
    discardLabel,
    onUseLatest,
    onKeep,
}: {
    readonly message: string;
    readonly error?: string;
    readonly onDiscard: () => void;
    readonly discardLabel: string;
    readonly onUseLatest?: () => void;
    readonly onKeep?: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div
            role="alert"
            className="flex flex-col gap-3 rounded-md bg-surface p-4 shadow-[inset_0_0_0_1.5px_var(--brass)]"
        >
            <p className="flex gap-2.5 text-sm leading-normal">
                <AdminMark tone="brass" className="mt-1.5" />
                {message}
            </p>
            {error && <p className={FIELD_ERROR_CLASS}>{error}</p>}
            <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={onDiscard} className={SMALL_SECONDARY_PILL_CLASS}>
                    {discardLabel}
                </button>
                {onUseLatest && (
                    <button
                        type="button"
                        onClick={onUseLatest}
                        className={SMALL_SECONDARY_PILL_CLASS}
                    >
                        {t("adminListingSources.locationDefault.actions.reviewLatest")}
                    </button>
                )}
                {onKeep && (
                    <button type="button" onClick={onKeep} className={ADMIN_SMALL_PRIMARY_CLASS}>
                        {t("adminListingSources.locationDefault.actions.keepDraft")}
                    </button>
                )}
            </div>
        </div>
    );
}

function FormFooter({
    submitLabel,
    disabled,
    pending,
    onCancel,
}: {
    readonly submitLabel: string;
    readonly disabled: boolean;
    readonly pending: boolean;
    readonly onCancel: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-wrap justify-end gap-2">
            <button
                type="button"
                disabled={pending}
                onClick={onCancel}
                className={SMALL_SECONDARY_PILL_CLASS}
            >
                {t("adminCommon.cancel")}
            </button>
            <button
                type="submit"
                disabled={disabled}
                aria-busy={pending}
                className={ADMIN_SMALL_PRIMARY_CLASS}
            >
                {pending ? t("adminCommon.saving") : submitLabel}
            </button>
        </div>
    );
}

function AssignForm({
    scope,
    locationScope,
    initialBase,
    latest,
    onDone,
}: {
    readonly scope: AdminSourceLocationDefaultScope;
    readonly locationScope: PartyLocationScope;
    readonly initialBase: SourceLocationDefault;
    readonly latest: SourceLocationDefault;
    readonly onDone: () => void;
}) {
    const { t } = useTranslation();
    const assign = useAssignAdminSourceLocationDefault(scope);
    const locations = usePartyLocationList(locationScope);
    // Every command carries the revision this form was opened (or explicitly rebased) with.
    const [base, setBase] = useState(initialBase);
    const [locationId, setLocationId] = useState<string>();
    const [draft, setDraft] = useState<ApplicabilityDraft>(EMPTY_APPLICABILITY_DRAFT);
    const [submitted, setSubmitted] = useState(false);
    const stale = latest.revision !== base.revision;
    const replacing = Boolean(base.assignment);
    const errors = submitted ? validateApplicabilityDraft(draft) : {};
    const selectionActive =
        locationId !== undefined &&
        Boolean(
            locations.data?.pages.some((page) =>
                page.items.some((item) => item.id === locationId && item.lifecycle === "ACTIVE"),
            ),
        );
    // A refetch can retire or remove the chosen site; the choice is never moved to another one.
    const selectionError =
        submitted && !selectionActive
            ? t(
                  locationId === undefined
                      ? "adminListingSources.locationDefault.validation.locationRequired"
                      : "adminListingSources.locationDefault.validation.locationInactive",
              )
            : undefined;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSubmitted(true);
        if (stale || assign.isPending) return;
        if (!locationId || !selectionActive) return;
        if (Object.keys(validateApplicabilityDraft(draft)).length > 0) return;
        assign.mutate(
            {
                expectedRevision: base.revision,
                partyLocationId: locationId,
                ...toAssignedApplicability(draft),
            },
            {
                onSuccess: () => {
                    toast.success(
                        t(
                            replacing
                                ? "adminListingSources.locationDefault.success.replaced"
                                : "adminListingSources.locationDefault.success.assigned",
                        ),
                    );
                    onDone();
                },
            },
        );
    };

    return (
        <form
            className={FORM_PANEL_CLASS}
            aria-label={t(
                replacing
                    ? "adminListingSources.locationDefault.assign.replaceTitle"
                    : "adminListingSources.locationDefault.assign.title",
            )}
            onSubmit={submit}
            noValidate
        >
            {stale && (
                <StaleBlock
                    message={t("adminListingSources.locationDefault.stale.changed", {
                        revision: latest.revision,
                    })}
                    discardLabel={t("adminListingSources.locationDefault.actions.discardDraft")}
                    onDiscard={onDone}
                    onUseLatest={() => {
                        assign.reset();
                        setBase(latest);
                        setLocationId(undefined);
                        setDraft(EMPTY_APPLICABILITY_DRAFT);
                        setSubmitted(false);
                    }}
                    onKeep={() => {
                        assign.reset();
                        setBase(latest);
                    }}
                />
            )}
            {replacing && base.hasUnsupportedValues && (
                <p className="text-meta text-ink-secondary">
                    {t("adminListingSources.locationDefault.assign.unsupportedValues")}
                </p>
            )}
            <div className="flex flex-col gap-2">
                <PartyLocationSelector
                    scope={locationScope}
                    name={`source-location-default-${scope.listingSourceId}`}
                    legend={t("adminListingSources.locationDefault.assign.locationLegend")}
                    value={locationId}
                    onChange={setLocationId}
                    disabled={assign.isPending}
                />
                {selectionError && (
                    <p role="alert" className={FIELD_ERROR_CLASS}>
                        {selectionError}
                    </p>
                )}
            </div>
            <ApplicabilityFields
                draft={draft}
                errors={errors}
                disabled={assign.isPending}
                onChange={(key, assertion) =>
                    setDraft((previous) => ({ ...previous, [key]: assertion }))
                }
            />
            {assign.error && (
                <p role="alert" className={FIELD_ERROR_CLASS}>
                    {assign.error.message}
                </p>
            )}
            <FormFooter
                submitLabel={t(
                    replacing
                        ? "adminListingSources.locationDefault.actions.confirmReplace"
                        : "adminListingSources.locationDefault.actions.confirmAssign",
                )}
                disabled={stale || assign.isPending}
                pending={assign.isPending}
                onCancel={onDone}
            />
        </form>
    );
}

function ApplicabilityForm({
    scope,
    initialBase,
    latest,
    onDone,
}: {
    readonly scope: AdminSourceLocationDefaultScope;
    readonly initialBase: SourceLocationDefault;
    readonly latest: SourceLocationDefault;
    readonly onDone: () => void;
}) {
    const { t } = useTranslation();
    const change = useChangeAdminSourceLocationDefaultApplicability(scope);
    const [base, setBase] = useState(initialBase);
    const [draft, setDraft] = useState(() => toApplicabilityDraft(initialBase));
    const [submitted, setSubmitted] = useState(false);
    const [noChanges, setNoChanges] = useState(false);
    const stale = latest.revision !== base.revision;
    // Applicability applies to the same active reference; another location needs a replacement.
    const latestCompatible =
        latest.eligibility === "ACTIVE" &&
        latest.assignment?.partyLocationId === base.assignment?.partyLocationId;
    const errors = submitted ? validateApplicabilityDraft(draft) : {};

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSubmitted(true);
        if (stale || change.isPending) return;
        if (Object.keys(validateApplicabilityDraft(draft)).length > 0) return;
        const changes = diffApplicabilityDraft(draft, toApplicabilityDraft(base));
        if (Object.keys(changes).length === 0) {
            setNoChanges(true);
            return;
        }
        change.mutate(
            { expectedRevision: base.revision, ...changes },
            {
                onSuccess: () => {
                    toast.success(t("adminListingSources.locationDefault.success.applicability"));
                    onDone();
                },
            },
        );
    };

    return (
        <form
            className={FORM_PANEL_CLASS}
            aria-label={t("adminListingSources.locationDefault.applicabilityForm.title")}
            onSubmit={submit}
            noValidate
        >
            {stale &&
                (latestCompatible ? (
                    <StaleBlock
                        message={t("adminListingSources.locationDefault.stale.changed", {
                            revision: latest.revision,
                        })}
                        discardLabel={t("adminListingSources.locationDefault.actions.discardDraft")}
                        onDiscard={onDone}
                        onUseLatest={() => {
                            change.reset();
                            setDraft(toApplicabilityDraft(latest));
                            setBase(latest);
                            setSubmitted(false);
                            setNoChanges(false);
                        }}
                        onKeep={() => {
                            change.reset();
                            setDraft(
                                rebaseApplicabilityDraft(
                                    draft,
                                    toApplicabilityDraft(base),
                                    toApplicabilityDraft(latest),
                                ),
                            );
                            setBase(latest);
                        }}
                    />
                ) : (
                    <StaleBlock
                        message={t(
                            "adminListingSources.locationDefault.stale.applicabilityUnavailable",
                        )}
                        discardLabel={t("adminListingSources.locationDefault.actions.discardDraft")}
                        onDiscard={onDone}
                    />
                ))}
            {base.hasUnsupportedValues && (
                <p className="text-meta text-ink-secondary">
                    {t("adminListingSources.locationDefault.applicabilityForm.unsupportedValues")}
                </p>
            )}
            <ApplicabilityFields
                draft={draft}
                errors={errors}
                disabled={change.isPending}
                onChange={(key, assertion) => {
                    setNoChanges(false);
                    setDraft((previous) => ({ ...previous, [key]: assertion }));
                }}
            />
            {noChanges && (
                <p role="status" className="text-meta text-ink-secondary">
                    {t("adminListingSources.locationDefault.applicabilityForm.noChanges")}
                </p>
            )}
            {change.error && (
                <p role="alert" className={FIELD_ERROR_CLASS}>
                    {change.error.message}
                </p>
            )}
            <FormFooter
                submitLabel={t("adminListingSources.locationDefault.actions.saveApplicability")}
                disabled={stale || change.isPending}
                pending={change.isPending}
                onCancel={onDone}
            />
        </form>
    );
}

function ClearConfirmation({
    scope,
    initialBase,
    latest,
    onDone,
}: {
    readonly scope: AdminSourceLocationDefaultScope;
    readonly initialBase: SourceLocationDefault;
    readonly latest: SourceLocationDefault;
    readonly onDone: () => void;
}) {
    const { t } = useTranslation();
    const clear = useClearAdminSourceLocationDefault(scope);
    const [base, setBase] = useState(initialBase);
    const stale = latest.revision !== base.revision;

    if (stale) {
        return latest.assignment ? (
            <StaleBlock
                message={t("adminListingSources.locationDefault.stale.changed", {
                    revision: latest.revision,
                })}
                error={clear.error?.message}
                discardLabel={t("adminCommon.cancel")}
                onDiscard={onDone}
                onUseLatest={() => {
                    clear.reset();
                    setBase(latest);
                }}
            />
        ) : (
            <StaleBlock
                message={t("adminListingSources.locationDefault.stale.alreadyCleared")}
                error={clear.error?.message}
                discardLabel={t("adminCommon.cancel")}
                onDiscard={onDone}
            />
        );
    }

    return (
        <AdminInlineConfirm
            message={t(
                base.eligibility === "RETIRED"
                    ? "adminListingSources.locationDefault.clear.confirmRetiredShort"
                    : "adminListingSources.locationDefault.clear.confirmShort",
            )}
            confirmLabel={t("adminListingSources.locationDefault.actions.confirmClear")}
            pending={clear.isPending}
            error={clear.error?.message}
            onCancel={onDone}
            onConfirm={() =>
                clear.mutate(base.revision, {
                    onSuccess: () => {
                        toast.success(t("adminListingSources.locationDefault.success.cleared"));
                        onDone();
                    },
                })
            }
        />
    );
}

function ApplicabilityFields({
    draft,
    errors,
    disabled,
    onChange,
}: {
    readonly draft: ApplicabilityDraft;
    readonly errors: ApplicabilityDraftErrors;
    readonly disabled: boolean;
    readonly onChange: (
        key: SourceLocationApplicability,
        assertion: ApplicabilityAssertionDraft,
    ) => void;
}) {
    const { t } = useTranslation();
    const idPrefix = useId();

    return (
        <fieldset className="flex flex-col gap-2.5" disabled={disabled}>
            <legend className={cn(FIELD_LABEL_CLASS, "mb-2")}>
                {t("adminListingSources.locationDefault.applicability.legend")}
            </legend>
            {SOURCE_LOCATION_APPLICABILITIES.map((key) => {
                const id = `${idPrefix}-${key}`;
                const assertion = draft[key];
                const error = errors[key];
                return (
                    <div key={key} className="flex flex-col gap-2.5">
                        <label
                            htmlFor={id}
                            className="flex cursor-pointer items-start gap-2.5 text-sm"
                        >
                            <input
                                id={id}
                                type="checkbox"
                                checked={assertion.asserted}
                                onChange={(event) =>
                                    onChange(key, { ...assertion, asserted: event.target.checked })
                                }
                                className="mt-0.5 size-[17px] shrink-0 accent-oxblood"
                            />
                            <span className="font-medium">
                                {t(
                                    `adminListingSources.locationDefault.applicability.${key}.label`,
                                )}
                            </span>
                        </label>
                        {assertion.asserted && (
                            <div className="ml-[27px] flex flex-col gap-1.5">
                                <label
                                    htmlFor={`${id}-evidence`}
                                    className={FIELD_LABEL_CLASS}
                                    data-error={error ? "true" : undefined}
                                >
                                    {t("adminListingSources.locationDefault.fields.evidenceLabel")}
                                </label>
                                <input
                                    id={`${id}-evidence`}
                                    value={assertion.reference}
                                    aria-invalid={error ? true : undefined}
                                    aria-describedby={error ? `${id}-evidence-error` : undefined}
                                    onChange={(event) =>
                                        onChange(key, {
                                            ...assertion,
                                            reference: event.target.value,
                                        })
                                    }
                                    className={cn(FIELD_CLASS, "bg-surface-raised text-sm")}
                                />
                                {error && (
                                    <p id={`${id}-evidence-error`} className={FIELD_ERROR_CLASS}>
                                        {t(
                                            `adminListingSources.locationDefault.validation.${error}`,
                                        )}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </fieldset>
    );
}
