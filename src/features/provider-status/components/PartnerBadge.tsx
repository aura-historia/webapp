import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

type PartnerBadgeSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<PartnerBadgeSize, { readonly badge: string; readonly seal: string }> = {
    sm: { badge: "h-5 gap-[5px] pr-[7px] pl-1 text-[10px]", seal: "size-3" },
    md: { badge: "h-6 gap-1.5 pr-[9px] pl-[5px] text-[11px]", seal: "size-3.5" },
    lg: { badge: "h-7 gap-[7px] pr-[11px] pl-1.5 text-xs", seal: "size-4" },
};

type PartnerBadgeProps = {
    readonly size?: PartnerBadgeSize;
    /** Use on the ink ground: a brass seal instead of the oxblood one. */
    readonly onInk?: boolean;
    readonly className?: string;
};

/**
 * Marks a provider with an active Aura Historia partnership: a seal and the mono label "Partner"
 * at every size, after the provider name. Screen readers hear "Aura Historia partner". Non-partners
 * get no badge. See the Redesign's "Partner badge" boards.
 */
export function PartnerBadge({ size = "md", onInk = false, className }: PartnerBadgeProps) {
    const { t } = useTranslation();
    const sizeClass = SIZE_CLASS[size];

    return (
        <span
            data-testid="partner-badge"
            className={cn(
                "inline-flex shrink-0 items-center rounded-sm bg-surface-sunken whitespace-nowrap text-ink",
                sizeClass.badge,
                className,
            )}
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className={cn("block shrink-0", sizeClass.seal)}
            >
                <path
                    d="M8 0.8l1.6 1.3 2-.3.8 1.9 1.9.8-.3 2L15.2 8l-1.2 1.6.3 2-1.9.8-.8 1.9-2-.3L8 15.2l-1.6-1.2-2 .3-.8-1.9-1.9-.8.3-2L.8 8l1.2-1.6-.3-2 1.9-.8.8-1.9 2 .3z"
                    fill={onInk ? "var(--color-brass-light)" : "var(--color-oxblood)"}
                />
                <path
                    d="M5.2 8.2l1.9 1.9 3.8-4"
                    fill="none"
                    stroke={onInk ? "#170D0E" : "var(--color-on-oxblood)"}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span aria-hidden="true" className="font-mono leading-none tracking-[0.14em] uppercase">
                {t("providerStatus.badge.label")}
            </span>
            <span className="sr-only">{t("providerStatus.badge.srLabel")}</span>
        </span>
    );
}
