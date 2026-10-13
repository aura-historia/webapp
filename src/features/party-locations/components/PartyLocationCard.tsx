import { type ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import type {
    PartyLocation,
    PartyLocationLifecycle,
} from "@/data/internal/geography/PartyLocation.ts";
import { formatCoordinates, formatCountryName } from "@/features/geography/lib/formatGeography.ts";
import { cn, formatDate } from "@/lib/utils.ts";
import { type PartyLocationScope, useSetPartyLocationLifecycle } from "../api/usePartyLocations.ts";
import { PartyLocationConsequence } from "./PartyLocationConsequence.tsx";
import { PartyLocationLifecycleBadge } from "./PartyLocationLifecycleBadge.tsx";

/**
 * One location with all protected details and its distinct actions: same-location correction,
 * relocation to a new identity, retirement and restoration. Lifecycle changes need confirmation
 * and are sent with the revision that was shown when confirmation began.
 */
export function PartyLocationCard({
    scope,
    location,
    onCorrect,
    onRelocate,
}: {
    readonly scope: PartyLocationScope;
    readonly location: PartyLocation;
    readonly onCorrect: (location: PartyLocation) => void;
    readonly onRelocate: (location: PartyLocation) => void;
}) {
    const { t, i18n } = useTranslation();
    const lifecycle = useSetPartyLocationLifecycle(scope);
    // The target outlives `confirmOpen` so the dialog keeps its copy while it animates out.
    const [confirming, setConfirming] = useState<{
        readonly lifecycle: PartyLocationLifecycle;
        readonly location: PartyLocation;
    }>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    // Retire and restore replace each other, so focus returns to whichever one is shown now.
    const lifecycleButton = useRef<HTMLButtonElement>(null);
    const titleId = `party-location-${location.id}-title`;
    const geography = location.geography;
    const position = location.position;
    const evidence = location.evidence;
    const notAsserted = t("partyLocations.fields.notAsserted");
    const retiring = confirming?.lifecycle === "RETIRED";

    const confirm = (target: PartyLocationLifecycle) => {
        lifecycle.reset();
        setConfirming({ lifecycle: target, location });
        setConfirmOpen(true);
    };

    const confirmLifecycle = () => {
        if (!confirming) return;
        lifecycle.mutate(confirming, {
            onSuccess: (updated) =>
                toast.success(
                    t(
                        updated.lifecycle === "RETIRED"
                            ? "partyLocations.success.retired"
                            : "partyLocations.success.restored",
                    ),
                ),
            onSettled: () => setConfirmOpen(false),
        });
    };

    return (
        <article
            aria-labelledby={titleId}
            className={cn(
                "grid gap-4 border bg-card p-4 sm:p-5",
                location.lifecycle !== "ACTIVE" && "bg-surface-container-low",
            )}
        >
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 id={titleId} className="break-words text-lg font-medium">
                            {location.label}
                        </h3>
                        <PartyLocationLifecycleBadge lifecycle={location.lifecycle} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t(`partyLocations.eligibility.${location.lifecycle}`)}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {location.lifecycle === "ACTIVE" && (
                        <>
                            <Button
                                type="button"
                                size="sm"
                                disabled={lifecycle.isPending}
                                onClick={() => onCorrect(location)}
                            >
                                {t("partyLocations.actions.correct")}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={lifecycle.isPending}
                                onClick={() => onRelocate(location)}
                            >
                                {t("partyLocations.actions.relocate")}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                ref={lifecycleButton}
                                disabled={lifecycle.isPending}
                                onClick={() => confirm("RETIRED")}
                            >
                                {t("partyLocations.actions.retire")}
                            </Button>
                        </>
                    )}
                    {location.lifecycle === "RETIRED" && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            ref={lifecycleButton}
                            disabled={lifecycle.isPending}
                            onClick={() => confirm("ACTIVE")}
                        >
                            {t("partyLocations.actions.restore")}
                        </Button>
                    )}
                </div>
            </header>

            {location.hasUnsupportedValues && (
                <p className="border border-border bg-surface-container p-3 text-sm">
                    {t("partyLocations.detail.unsupportedValues")}
                </p>
            )}

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow label={t("partyLocations.fields.roles")}>
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
                <DetailRow label={t("partyLocations.fields.locationId")}>
                    <span className="break-all font-mono text-sm">{location.id}</span>
                </DetailRow>
            </dl>

            {lifecycle.error && (
                <p role="alert" className="text-sm text-destructive">
                    {lifecycle.error.message}
                </p>
            )}

            <AlertDialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (!open && !lifecycle.isPending) setConfirmOpen(false);
                }}
            >
                <AlertDialogContent
                    onCloseAutoFocus={(event) => {
                        if (!lifecycleButton.current) return;
                        event.preventDefault();
                        lifecycleButton.current.focus();
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t(
                                retiring
                                    ? "partyLocations.confirm.retireTitle"
                                    : "partyLocations.confirm.restoreTitle",
                                { label: location.label },
                            )}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                <PartyLocationConsequence
                                    action={retiring ? "retire" : "restore"}
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={lifecycle.isPending}>
                            {t("partyLocations.actions.cancel")}
                        </AlertDialogCancel>
                        {/* A plain button keeps the dialog open until the request settles. */}
                        <Button
                            type="button"
                            variant={retiring ? "destructive" : "default"}
                            disabled={lifecycle.isPending}
                            onClick={confirmLifecycle}
                        >
                            {lifecycle.isPending
                                ? t("partyLocations.actions.saving")
                                : t(
                                      retiring
                                          ? "partyLocations.actions.confirmRetire"
                                          : "partyLocations.actions.confirmRestore",
                                  )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
        <div className={cn("grid min-w-0 content-start gap-1", wide && "sm:col-span-2")}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="break-words">{children}</dd>
        </div>
    );
}
