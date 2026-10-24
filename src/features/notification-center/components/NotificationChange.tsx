import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import type { NotificationPayload } from "@/data/internal/notification/Notification.ts";
import type { ListingAvailability } from "@/data/internal/product/ProductListingDomain.ts";
import {
    getListingStatusTone,
    type ListingStatusTone,
} from "@/features/product/detail/components/ListingStatusPill.tsx";
import {
    getNotificationChangeParts,
    getNotificationPriceDelta,
} from "@/features/notification-center/lib/notificationUtils.ts";
import { cn } from "@/lib/utils.ts";

type Size = "sm" | "lg";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

function ChangeArrow({ size }: { readonly size: Size }) {
    const { t } = useTranslation();
    return (
        <ArrowRight
            role="img"
            aria-label={t("notifications.changedTo")}
            className={cn("shrink-0 text-ink-muted", size === "sm" ? "size-3" : "size-4")}
            strokeWidth={size === "sm" ? 2 : 1.8}
        />
    );
}

function StatusDot({ tone }: { readonly tone: ListingStatusTone }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "size-[7px] shrink-0 rounded-pill border-[1.5px]",
                tone === "offered" && "border-ink bg-ink",
                tone === "reserved" && "border-brass bg-brass",
                tone === "ended" && "border-ink-muted",
                tone === "unknown" && "border-dashed border-ink-muted",
            )}
        />
    );
}

function DecisionPill({ approved, label }: { readonly approved: boolean; readonly label: string }) {
    return (
        <span
            className={cn(
                "inline-flex h-[22px] items-center rounded-pill px-2 font-mono text-tag tracking-[0.1em] uppercase",
                approved
                    ? "bg-ink text-surface-raised"
                    : "text-ink-secondary shadow-[inset_0_0_0_1px_var(--line-strong)]",
            )}
        >
            {label}
        </span>
    );
}

const tone = (availability: ListingAvailability | null) =>
    getListingStatusTone(availability, "ACTIVE");

/** What changed: struck old price to new, status to status, the matched filter or the decision. */
export function NotificationChange({
    payload,
    size,
    onNavigate,
}: {
    readonly payload: NotificationPayload;
    readonly size: Size;
    readonly onNavigate?: () => void;
}) {
    const { t, i18n } = useTranslation();
    const large = size === "lg";

    if (payload.type === "SEARCH_FILTER") {
        return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p
                    className={cn(
                        "text-ink-secondary [&_em]:font-serif [&_em]:text-ink",
                        large ? "text-body-sm [&_em]:text-base" : "text-meta [&_em]:text-sm",
                    )}
                >
                    <Trans
                        i18nKey="notifications.matchFor"
                        values={{ name: payload.userSearchFilterName }}
                        components={{ em: <em /> }}
                    />
                </p>
                {large && (
                    <Link
                        to="/$lng/me/search-filter/$filterId"
                        params={(current) => ({ ...current, filterId: payload.userSearchFilterId })}
                        from="/$lng"
                        onClick={onNavigate}
                        className={cn(
                            "inline-flex min-h-8 items-center gap-1.5 text-meta font-medium text-ink hover:text-brass-ink",
                            FOCUS_CLASS,
                        )}
                    >
                        {t("notifications.allMatches")}
                        <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    </Link>
                )}
            </div>
        );
    }

    if (payload.type === "PARTNER_APPLICATION") {
        const approved = payload.decision === "APPROVED";
        return (
            <div
                className={cn(
                    "flex flex-wrap items-center gap-2 text-ink-secondary",
                    large ? "text-body-sm" : "text-meta",
                )}
            >
                {t("notifications.partnerDecision")}
                <DecisionPill
                    approved={approved}
                    label={
                        approved
                            ? t("notifications.types.partnerApplicationStatusApproved")
                            : t("notifications.types.partnerApplicationStatusRejected")
                    }
                />
            </div>
        );
    }

    const parts = getNotificationChangeParts(payload, t, i18n.language);
    if (!parts) return null;

    if (payload.change.type === "PRICE_CHANGE") {
        const delta = large ? getNotificationPriceDelta(payload, i18n.language) : null;
        return (
            <div
                className={cn(
                    "flex flex-wrap items-center",
                    large ? "gap-x-3 gap-y-2.5" : "gap-2 text-meta",
                )}
            >
                <s
                    className={cn(
                        "text-ink-muted decoration-1",
                        large && "font-serif text-[17px] leading-[1.1] sm:text-[20px]",
                    )}
                >
                    {parts.from}
                </s>
                <ChangeArrow size={size} />
                <span
                    className={cn(
                        "text-ink",
                        large
                            ? "font-serif text-[22px] leading-[1.1] sm:text-[28px]"
                            : "font-semibold",
                    )}
                >
                    {parts.to}
                </span>
                {delta && (
                    <span className="rounded-pill bg-surface-sunken px-2 py-1 font-mono text-[11px] leading-none tracking-[0.06em] text-ink-secondary">
                        {delta}
                    </span>
                )}
            </div>
        );
    }

    const fromTone = tone(payload.change.oldAvailability);
    const toTone = tone(payload.change.newAvailability);

    if (!large) {
        return (
            <div className="flex flex-wrap items-center gap-2 text-meta">
                <span className="inline-flex items-center gap-1.5 text-ink-muted">
                    <StatusDot tone={fromTone} />
                    {parts.from}
                </span>
                <ChangeArrow size={size} />
                <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                    <StatusDot tone={toTone} />
                    {parts.to}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex h-[30px] items-center gap-2 rounded-pill px-3 text-meta text-ink-muted shadow-[inset_0_0_0_1px_var(--line)]">
                <StatusDot tone={fromTone} />
                <s>{parts.from}</s>
            </span>
            <ChangeArrow size={size} />
            <span className="inline-flex h-[30px] items-center gap-2 rounded-pill px-3 text-meta font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]">
                <StatusDot tone={toTone} />
                {parts.to}
            </span>
        </div>
    );
}
