import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type {
    PartyLocation,
    PartyLocationLifecycle,
} from "@/data/internal/geography/PartyLocation.ts";
import {
    AdminMark,
    type AdminMarkTone,
} from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_SMALL_DANGER_OUTLINE_CLASS,
    ADMIN_TAG_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { AdminConfirmDialog } from "@/features/admin/party-management/components/AdminConfirmDialog.tsx";
import { formatCoordinates } from "@/features/geography/lib/formatGeography.ts";
import { cn, formatShortDate } from "@/lib/utils.ts";
import { type PartyLocationScope, useSetPartyLocationLifecycle } from "../api/usePartyLocations.ts";
import { formatPartyLocationRegion } from "../lib/partyLocationSummary.ts";
import { PartyLocationConsequence } from "./PartyLocationConsequence.tsx";

const LIFECYCLE_TONE: Record<PartyLocation["lifecycle"], AdminMarkTone> = {
    ACTIVE: "ink",
    RETIRED: "hollow",
    UNKNOWN: "dashed",
};

/**
 * One location with all protected details and its distinct actions (board "Admin · Organization",
 * location cards): same-location correction, relocation to a new identity, retirement and
 * restoration. Lifecycle changes need confirmation and are sent with the revision that was shown
 * when confirmation began.
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

    const coordinates = position
        ? [
              formatCoordinates(position.point, i18n.language, t),
              [
                  t(`partyLocations.precisions.${position.precision}`),
                  position.accuracyMetres === undefined
                      ? undefined
                      : `±${new Intl.NumberFormat(i18n.language, {
                            style: "unit",
                            unit: "meter",
                            maximumFractionDigits: 1,
                        }).format(position.accuracyMetres)}`,
              ]
                  .filter(Boolean)
                  .join(", "),
          ].join(" · ")
        : undefined;
    const evidenceText = evidence
        ? [
              evidence.reference,
              t(`partyLocations.evidenceScopes.${evidence.scope}`),
              evidence.observedAt
                  ? t("partyLocations.card.observed", {
                        date: formatShortDate(evidence.observedAt, i18n.language, "UTC"),
                    })
                  : undefined,
          ]
              .filter(Boolean)
              .join(" · ")
        : undefined;
    const rows = [
        {
            key: "region",
            label: t("partyLocations.card.countryRegion"),
            value: formatPartyLocationRegion(location, i18n.language, t),
        },
        {
            key: "coordinates",
            label: t("partyLocations.fields.coordinates"),
            value: coordinates ?? notAsserted,
            mono: Boolean(coordinates),
            muted: !coordinates,
        },
        {
            key: "evidence",
            label: t("partyLocations.card.evidence"),
            value: evidenceText ?? notAsserted,
            muted: !evidenceText,
        },
        {
            key: "public",
            label: t("partyLocations.card.publicResults"),
            value: t(`partyLocations.card.public.${location.lifecycle}`),
        },
        {
            key: "id",
            label: t("partyLocations.fields.locationId"),
            value: location.id,
            mono: true,
        },
    ];

    return (
        <article
            aria-labelledby={titleId}
            className={cn(
                "flex h-full flex-col gap-4 rounded-panel p-5 shadow-ring sm:p-[22px]",
                location.lifecycle === "ACTIVE" ? "bg-surface-raised" : "bg-surface",
            )}
        >
            <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
                    <AdminMark tone={LIFECYCLE_TONE[location.lifecycle]} className="size-2" />
                    {t(`partyLocations.lifecycle.${location.lifecycle}`)}
                </span>
                <h3
                    id={titleId}
                    className="font-serif text-[22px] leading-[1.2] font-normal break-words"
                >
                    {location.label}
                </h3>
                {location.geography?.addressText && (
                    <p className="text-sm leading-normal whitespace-pre-line text-ink-secondary">
                        {location.geography.addressText}
                    </p>
                )}
                <ul aria-label={t("partyLocations.fields.roles")} className="flex flex-wrap gap-1">
                    {location.roles.length > 0 ? (
                        location.roles.map((role) => (
                            <li key={role} className={ADMIN_TAG_CLASS}>
                                {t(`partyLocations.roles.${role}`)}
                            </li>
                        ))
                    ) : (
                        <li className="text-xs text-ink-muted">
                            {t("partyLocations.fields.noRoles")}
                        </li>
                    )}
                </ul>
            </div>

            {location.hasUnsupportedValues && (
                <p className="rounded-md bg-surface-sunken px-3 py-2 text-meta text-ink-secondary">
                    {t("partyLocations.detail.unsupportedValues")}
                </p>
            )}

            <dl className="border-t border-line">
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-baseline gap-3 border-b border-line-subtle py-2"
                    >
                        <dt className="text-xs text-ink-muted">{row.label}</dt>
                        <dd
                            className={cn(
                                "[overflow-wrap:anywhere]",
                                row.mono ? "font-mono text-[11px]" : "text-meta",
                                row.muted && "text-ink-muted",
                            )}
                        >
                            {row.value}
                        </dd>
                    </div>
                ))}
            </dl>

            {(location.lifecycle === "ACTIVE" || location.lifecycle === "RETIRED") && (
                <div className="mt-auto flex flex-wrap gap-2">
                    {location.lifecycle === "ACTIVE" ? (
                        <>
                            <button
                                type="button"
                                disabled={lifecycle.isPending}
                                onClick={() => onCorrect(location)}
                                className={SMALL_SECONDARY_PILL_CLASS}
                            >
                                {t("partyLocations.actions.correct")}
                            </button>
                            <button
                                type="button"
                                disabled={lifecycle.isPending}
                                onClick={() => onRelocate(location)}
                                className={SMALL_SECONDARY_PILL_CLASS}
                            >
                                {t("partyLocations.actions.relocate")}
                            </button>
                            <button
                                ref={lifecycleButton}
                                type="button"
                                disabled={lifecycle.isPending}
                                onClick={() => confirm("RETIRED")}
                                className={ADMIN_SMALL_DANGER_OUTLINE_CLASS}
                            >
                                {t("partyLocations.actions.retire")}
                            </button>
                        </>
                    ) : (
                        <button
                            ref={lifecycleButton}
                            type="button"
                            disabled={lifecycle.isPending}
                            onClick={() => confirm("ACTIVE")}
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {t("partyLocations.actions.restore")}
                        </button>
                    )}
                </div>
            )}

            {lifecycle.error && !confirmOpen && (
                <p role="alert" className="text-meta text-oxblood">
                    {lifecycle.error.message}
                </p>
            )}

            <AdminConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                tone={retiring ? "danger" : "primary"}
                title={t(
                    retiring
                        ? "partyLocations.confirm.retireTitle"
                        : "partyLocations.confirm.restoreTitle",
                    { label: location.label },
                )}
                description={<PartyLocationConsequence action={retiring ? "retire" : "restore"} />}
                confirmLabel={t(
                    retiring
                        ? "partyLocations.actions.confirmRetire"
                        : "partyLocations.actions.confirmRestore",
                )}
                pending={lifecycle.isPending}
                onConfirm={confirmLifecycle}
                onCloseAutoFocus={(event) => {
                    if (!lifecycleButton.current) return;
                    event.preventDefault();
                    lifecycleButton.current.focus();
                }}
            />
        </article>
    );
}
