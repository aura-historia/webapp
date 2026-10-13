import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type {
    PartyLocation,
    PartyLocationLifecycle,
} from "@/data/internal/geography/PartyLocation.ts";
import { formatCoordinates, formatCountryName } from "@/features/geography/lib/formatGeography.ts";
import { formatDate } from "@/lib/utils.ts";
import {
    PartyLocationRequestError,
    type PartyLocationScope,
    usePartyLocation,
    useSetPartyLocationLifecycle,
} from "../api/usePartyLocations.ts";
import { PartyLocationConsequence } from "./PartyLocationConsequence.tsx";
import { PartyLocationLifecycleBadge } from "./PartyLocationLifecycleBadge.tsx";

/**
 * Protected detail of one site with its distinct actions: same-site correction, relocation to a
 * new identity, retirement and restoration. Lifecycle changes need explicit confirmation and are
 * sent with the revision that was shown when confirmation began. Pass `key={locationId}`.
 */
export function PartyLocationDetail({
    scope,
    locationId,
    onCorrect,
    onRelocate,
}: {
    readonly scope: PartyLocationScope;
    readonly locationId: string;
    readonly onCorrect: (location: PartyLocation) => void;
    readonly onRelocate: (location: PartyLocation) => void;
}) {
    const { t, i18n } = useTranslation();
    const query = usePartyLocation(scope, locationId);
    const lifecycle = useSetPartyLocationLifecycle(scope);
    const [confirming, setConfirming] = useState<{
        readonly lifecycle: PartyLocationLifecycle;
        readonly location: PartyLocation;
    }>();
    const accessLost = query.error instanceof PartyLocationRequestError && query.error.isAccessLoss;
    const location = accessLost ? undefined : query.data;

    if (!location) {
        if (query.error) {
            return (
                <div role="alert" className="grid justify-items-start gap-3">
                    <p className="text-muted-foreground">{query.error.message}</p>
                    <Button type="button" variant="outline" onClick={() => query.refetch()}>
                        {t("partyLocations.actions.retry")}
                    </Button>
                </div>
            );
        }
        return (
            <div className="grid gap-3" aria-busy="true">
                <output className="sr-only">{t("partyLocations.detail.loading")}</output>
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    const geography = location.geography;
    const position = location.position;
    const evidence = location.evidence;
    const notAsserted = t("partyLocations.fields.notAsserted");
    const busy = lifecycle.isPending || query.isFetching;

    const confirmLifecycle = () => {
        if (!confirming) return;
        lifecycle.mutate(confirming, {
            onSuccess: (updated) => {
                toast.success(
                    t(
                        updated.lifecycle === "RETIRED"
                            ? "partyLocations.success.retired"
                            : "partyLocations.success.restored",
                    ),
                );
                setConfirming(undefined);
            },
            onError: () => setConfirming(undefined),
        });
    };

    return (
        <article className="grid gap-5" aria-labelledby="party-location-detail-title">
            <header className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h3
                        id="party-location-detail-title"
                        className="break-words text-xl font-medium"
                    >
                        {location.label}
                    </h3>
                    <PartyLocationLifecycleBadge lifecycle={location.lifecycle} />
                </div>
                <p className="text-sm text-muted-foreground">
                    {t(`partyLocations.eligibility.${location.lifecycle}`)}
                </p>
            </header>

            {location.hasUnsupportedValues && (
                <p className="border border-border bg-surface-container p-3 text-sm">
                    {t("partyLocations.detail.unsupportedValues")}
                </p>
            )}

            <dl className="grid gap-4 sm:grid-cols-2">
                <DetailRow label={t("partyLocations.fields.roles")} wide>
                    {location.roles.length > 0
                        ? location.roles.map((role) => t(`partyLocations.roles.${role}`)).join(", ")
                        : t("partyLocations.fields.noRoles")}
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.addressText")} wide>
                    <span className="whitespace-pre-wrap">
                        {geography?.addressText ?? notAsserted}
                    </span>
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.country")}>
                    {geography?.country
                        ? `${formatCountryName(geography.country, i18n.language)} (${geography.country})`
                        : notAsserted}
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.subdivision")}>
                    {geography?.subdivision ?? notAsserted}
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.postalCode")}>
                    {geography?.postalCode ?? notAsserted}
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.coordinates")}>
                    {position ? formatCoordinates(position.point, i18n.language, t) : notAsserted}
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.precision")}>
                    {position ? t(`partyLocations.precisions.${position.precision}`) : notAsserted}
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.accuracyMetres")}>
                    {position?.accuracyMetres === undefined
                        ? notAsserted
                        : new Intl.NumberFormat(i18n.language, {
                              style: "unit",
                              unit: "meter",
                              maximumFractionDigits: 1,
                          }).format(position.accuracyMetres)}
                </DetailRow>
                <DetailRow label={t("partyLocations.fields.evidenceReference")} wide>
                    <span className="break-all">{evidence?.reference ?? notAsserted}</span>
                </DetailRow>
                {evidence && (
                    <>
                        <DetailRow label={t("partyLocations.fields.evidenceScope")}>
                            {t(`partyLocations.evidenceScopes.${evidence.scope}`)}
                        </DetailRow>
                        <DetailRow label={t("partyLocations.fields.evidenceObservedOn")}>
                            {evidence.observedAt ? (
                                <time dateTime={evidence.observedAt.toISOString()}>
                                    {formatDate(evidence.observedAt, i18n.language, "UTC")}
                                </time>
                            ) : (
                                notAsserted
                            )}
                        </DetailRow>
                    </>
                )}
                <DetailRow label={t("partyLocations.fields.locationId")} wide>
                    <span className="break-all font-mono text-sm">{location.id}</span>
                </DetailRow>
            </dl>

            {lifecycle.error && (
                <p role="alert" className="text-sm text-destructive">
                    {lifecycle.error.message}
                </p>
            )}

            {confirming ? (
                <div className="grid gap-3 border border-destructive/40 bg-destructive/5 p-4">
                    <p className="text-sm font-medium">
                        {t(
                            confirming.lifecycle === "RETIRED"
                                ? "partyLocations.detail.confirmRetire"
                                : "partyLocations.detail.confirmRestore",
                        )}
                    </p>
                    <PartyLocationConsequence
                        action={confirming.lifecycle === "RETIRED" ? "retire" : "restore"}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={confirming.lifecycle === "RETIRED" ? "destructive" : "default"}
                            disabled={lifecycle.isPending}
                            onClick={confirmLifecycle}
                        >
                            {lifecycle.isPending
                                ? t("partyLocations.actions.saving")
                                : t(
                                      confirming.lifecycle === "RETIRED"
                                          ? "partyLocations.actions.confirmRetire"
                                          : "partyLocations.actions.confirmRestore",
                                  )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={lifecycle.isPending}
                            onClick={() => setConfirming(undefined)}
                        >
                            {t("partyLocations.actions.cancel")}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {location.lifecycle === "ACTIVE" && (
                        <>
                            <Button
                                type="button"
                                disabled={busy}
                                onClick={() => onCorrect(location)}
                            >
                                {t("partyLocations.actions.correct")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => onRelocate(location)}
                            >
                                {t("partyLocations.actions.relocate")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => {
                                    lifecycle.reset();
                                    setConfirming({ lifecycle: "RETIRED", location });
                                }}
                            >
                                {t("partyLocations.actions.retire")}
                            </Button>
                        </>
                    )}
                    {location.lifecycle === "RETIRED" && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            onClick={() => {
                                lifecycle.reset();
                                setConfirming({ lifecycle: "ACTIVE", location });
                            }}
                        >
                            {t("partyLocations.actions.restore")}
                        </Button>
                    )}
                </div>
            )}
        </article>
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
