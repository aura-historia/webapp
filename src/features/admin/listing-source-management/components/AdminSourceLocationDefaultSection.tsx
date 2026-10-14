import { Link } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { SourceLocationDefault } from "@/data/internal/geography/SourceLocationDefault.ts";
import type { AdminListingSourceDetail } from "@/data/internal/listing-source/AdminListingSource.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import {
    type PartyLocationScope,
    usePartyLocationList,
} from "@/features/party-locations/api/usePartyLocations.ts";
import { PartyLocationLifecycleBadge } from "@/features/party-locations/components/PartyLocationLifecycleBadge.tsx";
import { PartyLocationSelector } from "@/features/party-locations/components/PartyLocationSelector.tsx";
import { formatPartyLocationRegion } from "@/features/party-locations/lib/partyLocationSummary.ts";
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

/**
 * The listing source's explicit default location: its state and revision, assignment from the
 * operator's active locations, independent applicability and clearing. Location details come
 * from the operator's Party locations; the default read itself carries only the reference.
 */
export function AdminSourceLocationDefaultSection({
    source,
}: {
    readonly source: AdminListingSourceDetail;
}) {
    const { t } = useTranslation();
    const { user } = useResolvedAuth();
    const titleId = `admin-source-location-default-${source.listingSourceId}`;

    return (
        <section className="grid gap-4 border-t pt-5" aria-labelledby={titleId}>
            <header className="grid gap-1">
                <h3 id={titleId} className="font-medium">
                    {t("adminListingSources.locationDefault.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t("adminListingSources.locationDefault.description")}
                </p>
            </header>
            {user ? (
                <SourceLocationDefaultWorkflow
                    // A changed operator owns other locations; never keep a draft across it.
                    key={`${source.listingSourceId}:${source.operator.partyId}`}
                    scope={{
                        viewerCacheKey: user.userId,
                        listingSourceId: source.listingSourceId,
                        operatorPartyId: source.operator.partyId,
                    }}
                    operatorName={source.operator.name}
                />
            ) : (
                <Skeleton className="h-32 w-full" />
            )}
        </section>
    );
}

function SourceLocationDefaultWorkflow({
    scope,
    operatorName,
}: {
    readonly scope: AdminSourceLocationDefaultScope;
    readonly operatorName: string;
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
            return (
                <div role="alert" className="grid justify-items-start gap-3">
                    <p className="text-sm text-muted-foreground">{query.error.message}</p>
                    <Button type="button" variant="outline" onClick={() => query.refetch()}>
                        {t("adminListingSources.actions.retry")}
                    </Button>
                </div>
            );
        }
        return (
            <div className="grid gap-2" aria-busy="true">
                <output className="sr-only">
                    {t("adminListingSources.locationDefault.loading")}
                </output>
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    const view = () => setMode({ kind: "view" });
    const assignment = current.assignment;

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
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    size="sm"
                    onClick={() => setMode({ kind: "assign", base: current })}
                >
                    {t(
                        assignment
                            ? "adminListingSources.locationDefault.actions.replace"
                            : "adminListingSources.locationDefault.actions.assign",
                    )}
                </Button>
                {assignment && current.eligibility === "ACTIVE" && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setMode({ kind: "applicability", base: current })}
                    >
                        {t("adminListingSources.locationDefault.actions.editApplicability")}
                    </Button>
                )}
                {assignment && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setMode({ kind: "clear", base: current })}
                    >
                        {t("adminListingSources.locationDefault.actions.clear")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <CurrentDefault current={current} locationScope={locationScope} />
            {query.error && (
                <p role="alert" className="text-sm text-destructive">
                    {query.error.message}
                </p>
            )}
            {workflow}
            <div className="grid gap-1 text-sm">
                <Link
                    to="/$lng/admin/parties/$partyId"
                    from="/$lng"
                    params={(previous) => ({ ...previous, partyId: scope.operatorPartyId })}
                    className="w-fit text-primary underline-offset-4 hover:underline"
                >
                    {t("adminListingSources.locationDefault.links.operatorLocations", {
                        name: operatorName,
                    })}
                </Link>
                <p className="text-muted-foreground">
                    {t("adminListingSources.locationDefault.links.operatorLocationsHint")}
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                {t("adminListingSources.locationDefault.propagation")}
            </p>
        </div>
    );
}

function CurrentDefault({
    current,
    locationScope,
}: {
    readonly current: SourceLocationDefault;
    readonly locationScope: PartyLocationScope;
}) {
    const { t } = useTranslation();
    const assignment = current.assignment;
    const notAsserted = t("adminListingSources.locationDefault.fields.notAsserted");

    return (
        <div className="grid gap-3">
            <dl className="grid gap-3 sm:grid-cols-2">
                <DetailRow label={t("adminListingSources.locationDefault.fields.location")} wide>
                    {assignment ? (
                        <ReferencedLocation
                            locationId={assignment.partyLocationId}
                            locationScope={locationScope}
                        />
                    ) : (
                        t("adminListingSources.locationDefault.fields.noDefault")
                    )}
                </DetailRow>
                {assignment &&
                    SOURCE_LOCATION_APPLICABILITIES.map((key) => {
                        const reference = assignment[key];
                        return (
                            <DetailRow
                                key={key}
                                label={t(
                                    `adminListingSources.locationDefault.applicability.${key}.label`,
                                )}
                            >
                                {reference === undefined ? (
                                    notAsserted
                                ) : (
                                    <span className="grid gap-0.5">
                                        <span>
                                            {t(
                                                "adminListingSources.locationDefault.fields.asserted",
                                            )}
                                        </span>
                                        <span className="break-all text-sm text-muted-foreground">
                                            {t(
                                                "adminListingSources.locationDefault.fields.evidence",
                                                { reference },
                                            )}
                                        </span>
                                    </span>
                                )}
                            </DetailRow>
                        );
                    })}
                <DetailRow label={t("adminListingSources.locationDefault.fields.revision")}>
                    <span className="font-mono text-sm">{current.revision}</span>
                </DetailRow>
            </dl>
            <p className="border border-border bg-surface-container p-3 text-sm">
                {t(`adminListingSources.locationDefault.effect.${geographyEffect(current)}`)}
            </p>
            {current.hasUnsupportedValues && (
                <p className="text-sm text-muted-foreground">
                    {t("adminListingSources.locationDefault.unsupportedValues")}
                </p>
            )}
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
        <span className="grid gap-1">
            {location ? (
                <>
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="break-words font-medium">{location.label}</span>
                        <PartyLocationLifecycleBadge lifecycle={location.lifecycle} />
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {formatPartyLocationRegion(location, i18n.language, t)}
                    </span>
                </>
            ) : (
                <span className="text-sm text-muted-foreground">
                    {t("adminListingSources.locationDefault.fields.locationDetailsUnavailable")}
                </span>
            )}
            <span className="break-all font-mono text-xs text-muted-foreground">{locationId}</span>
        </span>
    );
}

/** Explains a changed default and lets the administrator adopt it or abandon the action. */
function StaleNotice({
    message,
    keepLabel,
    onKeep,
    onDiscard,
    discardLabel,
}: {
    readonly message: string;
    readonly keepLabel?: string;
    readonly onKeep?: () => void;
    readonly discardLabel: string;
    readonly onDiscard: () => void;
}) {
    return (
        <div role="alert" className="grid gap-3 border border-border bg-surface-container p-3">
            <p className="text-sm">{message}</p>
            <div className="flex flex-wrap gap-2">
                {onKeep && keepLabel && (
                    <Button type="button" size="sm" onClick={onKeep}>
                        {keepLabel}
                    </Button>
                )}
                <Button type="button" size="sm" variant="outline" onClick={onDiscard}>
                    {discardLabel}
                </Button>
            </div>
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
            className="grid gap-4 border bg-card p-4"
            aria-label={t(
                replacing
                    ? "adminListingSources.locationDefault.assign.replaceTitle"
                    : "adminListingSources.locationDefault.assign.title",
            )}
            onSubmit={submit}
            noValidate
        >
            <p className="text-sm text-muted-foreground">
                {t(
                    replacing
                        ? "adminListingSources.locationDefault.assign.replaceDescription"
                        : "adminListingSources.locationDefault.assign.description",
                )}
            </p>
            {replacing && base.hasUnsupportedValues && (
                <p className="text-sm text-muted-foreground">
                    {t("adminListingSources.locationDefault.assign.unsupportedValues")}
                </p>
            )}
            <div className="grid gap-2">
                <PartyLocationSelector
                    scope={locationScope}
                    name={`source-location-default-${scope.listingSourceId}`}
                    legend={t("adminListingSources.locationDefault.assign.locationLegend")}
                    value={locationId}
                    onChange={setLocationId}
                    disabled={assign.isPending}
                />
                {selectionError && (
                    <p role="alert" className="text-sm text-destructive">
                        {selectionError}
                    </p>
                )}
            </div>
            <ApplicabilityFields
                idPrefix={`source-location-default-assign-${scope.listingSourceId}`}
                draft={draft}
                errors={errors}
                disabled={assign.isPending}
                onChange={(key, assertion) =>
                    setDraft((previous) => ({ ...previous, [key]: assertion }))
                }
            />
            {stale && (
                <StaleNotice
                    message={t("adminListingSources.locationDefault.stale.assign")}
                    keepLabel={t("adminListingSources.locationDefault.actions.keepDraft")}
                    onKeep={() => {
                        assign.reset();
                        setBase(latest);
                    }}
                    discardLabel={t("adminListingSources.locationDefault.actions.discardDraft")}
                    onDiscard={onDone}
                />
            )}
            {assign.error && (
                <p role="alert" className="text-sm text-destructive">
                    {assign.error.message}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={stale || assign.isPending}>
                    {assign.isPending
                        ? t("adminListingSources.actions.saving")
                        : t(
                              replacing
                                  ? "adminListingSources.locationDefault.actions.confirmReplace"
                                  : "adminListingSources.locationDefault.actions.confirmAssign",
                          )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={assign.isPending}
                    onClick={onDone}
                >
                    {t("adminListingSources.actions.cancel")}
                </Button>
            </div>
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
            className="grid gap-4 border bg-card p-4"
            aria-label={t("adminListingSources.locationDefault.applicabilityForm.title")}
            onSubmit={submit}
            noValidate
        >
            <p className="text-sm text-muted-foreground">
                {t("adminListingSources.locationDefault.applicabilityForm.description")}
            </p>
            {base.hasUnsupportedValues && (
                <p className="text-sm text-muted-foreground">
                    {t("adminListingSources.locationDefault.applicabilityForm.unsupportedValues")}
                </p>
            )}
            <ApplicabilityFields
                idPrefix={`source-location-default-applicability-${scope.listingSourceId}`}
                draft={draft}
                errors={errors}
                disabled={change.isPending}
                onChange={(key, assertion) => {
                    setNoChanges(false);
                    setDraft((previous) => ({ ...previous, [key]: assertion }));
                }}
            />
            {stale &&
                (latestCompatible ? (
                    <StaleNotice
                        message={t("adminListingSources.locationDefault.stale.applicability")}
                        keepLabel={t("adminListingSources.locationDefault.actions.keepDraft")}
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
                        discardLabel={t("adminListingSources.locationDefault.actions.discardDraft")}
                        onDiscard={onDone}
                    />
                ) : (
                    <StaleNotice
                        message={t(
                            "adminListingSources.locationDefault.stale.applicabilityUnavailable",
                        )}
                        discardLabel={t("adminListingSources.locationDefault.actions.discardDraft")}
                        onDiscard={onDone}
                    />
                ))}
            {noChanges && (
                <p role="status" className="text-sm text-muted-foreground">
                    {t("adminListingSources.locationDefault.applicabilityForm.noChanges")}
                </p>
            )}
            {change.error && (
                <p role="alert" className="text-sm text-destructive">
                    {change.error.message}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={stale || change.isPending}>
                    {change.isPending
                        ? t("adminListingSources.actions.saving")
                        : t("adminListingSources.locationDefault.actions.saveApplicability")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={change.isPending}
                    onClick={onDone}
                >
                    {t("adminListingSources.actions.cancel")}
                </Button>
            </div>
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

    return (
        <div className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm">
                {t(
                    base.eligibility === "RETIRED"
                        ? "adminListingSources.locationDefault.clear.confirmRetired"
                        : "adminListingSources.locationDefault.clear.confirm",
                )}
            </p>
            {stale &&
                (latest.assignment ? (
                    <StaleNotice
                        message={t("adminListingSources.locationDefault.stale.clear")}
                        keepLabel={t("adminListingSources.locationDefault.actions.reviewLatest")}
                        onKeep={() => {
                            clear.reset();
                            setBase(latest);
                        }}
                        discardLabel={t("adminListingSources.actions.cancel")}
                        onDiscard={onDone}
                    />
                ) : (
                    <StaleNotice
                        message={t("adminListingSources.locationDefault.stale.alreadyCleared")}
                        discardLabel={t("adminListingSources.actions.cancel")}
                        onDiscard={onDone}
                    />
                ))}
            {clear.error && (
                <p role="alert" className="text-sm text-destructive">
                    {clear.error.message}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="destructive"
                    disabled={stale || clear.isPending}
                    onClick={() =>
                        clear.mutate(base.revision, {
                            onSuccess: () => {
                                toast.success(
                                    t("adminListingSources.locationDefault.success.cleared"),
                                );
                                onDone();
                            },
                        })
                    }
                >
                    {clear.isPending
                        ? t("adminListingSources.locationDefault.actions.clearing")
                        : t("adminListingSources.locationDefault.actions.confirmClear")}
                </Button>
                <Button type="button" variant="outline" disabled={clear.isPending} onClick={onDone}>
                    {t("adminListingSources.actions.cancel")}
                </Button>
            </div>
        </div>
    );
}

function ApplicabilityFields({
    idPrefix,
    draft,
    errors,
    disabled,
    onChange,
}: {
    readonly idPrefix: string;
    readonly draft: ApplicabilityDraft;
    readonly errors: ApplicabilityDraftErrors;
    readonly disabled: boolean;
    readonly onChange: (
        key: SourceLocationApplicability,
        assertion: ApplicabilityAssertionDraft,
    ) => void;
}) {
    const { t } = useTranslation();
    const hintId = `${idPrefix}-hint`;

    return (
        <fieldset className="grid gap-3" disabled={disabled} aria-describedby={hintId}>
            <legend className="text-sm font-medium">
                {t("adminListingSources.locationDefault.applicability.legend")}
            </legend>
            <p id={hintId} className="text-xs text-muted-foreground">
                {t("adminListingSources.locationDefault.applicability.hint")}
            </p>
            {SOURCE_LOCATION_APPLICABILITIES.map((key) => {
                const id = `${idPrefix}-${key}`;
                const assertion = draft[key];
                const error = errors[key];
                return (
                    <div key={key} className="grid gap-3 border bg-surface-container-low p-3">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id={id}
                                checked={assertion.asserted}
                                disabled={disabled}
                                aria-describedby={`${id}-description`}
                                className="mt-0.5"
                                onCheckedChange={(checked) =>
                                    onChange(key, { ...assertion, asserted: checked === true })
                                }
                            />
                            <div className="grid gap-1">
                                <Label htmlFor={id}>
                                    {t(
                                        `adminListingSources.locationDefault.applicability.${key}.label`,
                                    )}
                                </Label>
                                <p
                                    id={`${id}-description`}
                                    className="text-xs text-muted-foreground"
                                >
                                    {t(
                                        `adminListingSources.locationDefault.applicability.${key}.description`,
                                    )}
                                </p>
                            </div>
                        </div>
                        {assertion.asserted && (
                            <div className="grid gap-2 sm:pl-7">
                                <Label htmlFor={`${id}-evidence`}>
                                    {t(
                                        "adminListingSources.locationDefault.fields.evidenceReference",
                                    )}
                                </Label>
                                <Input
                                    id={`${id}-evidence`}
                                    value={assertion.reference}
                                    aria-invalid={Boolean(error)}
                                    aria-describedby={
                                        error ? `${id}-evidence-error` : `${id}-evidence-hint`
                                    }
                                    onChange={(event) =>
                                        onChange(key, {
                                            ...assertion,
                                            reference: event.target.value,
                                        })
                                    }
                                />
                                {error ? (
                                    <p
                                        id={`${id}-evidence-error`}
                                        className="text-sm text-destructive"
                                    >
                                        {t(
                                            `adminListingSources.locationDefault.validation.${error}`,
                                        )}
                                    </p>
                                ) : (
                                    <p
                                        id={`${id}-evidence-hint`}
                                        className="text-xs text-muted-foreground"
                                    >
                                        {t(
                                            "adminListingSources.locationDefault.applicability.evidenceHint",
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

function DetailRow({
    label,
    wide = false,
    children,
}: {
    readonly label: string;
    readonly wide?: boolean;
    readonly children: ReactNode;
}) {
    return (
        <div className={wide ? "grid min-w-0 gap-1 sm:col-span-2" : "grid min-w-0 gap-1"}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="break-words">{children}</dd>
        </div>
    );
}
