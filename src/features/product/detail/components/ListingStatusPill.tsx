import { useTranslation } from "react-i18next";
import type {
    ListingAvailability,
    ListingLifecycle,
} from "@/data/internal/product/ProductListingDomain.ts";
import { getListingStatusLabelKey } from "@/features/product/catalog/components/badges/ListingStatusBadge.tsx";
import { cn } from "@/lib/utils.ts";

export type ListingStatusTone = "offered" | "reserved" | "ended" | "unknown";

const ENDED: readonly ListingAvailability[] = ["UNAVAILABLE", "OUT_OF_STOCK", "SOLD_OUT"];

/** Offered listings get an ink dot, reserved a brass dot, ended a hollow dot, unreported a dashed one. */
export function getListingStatusTone(
    availability: ListingAvailability | null,
    lifecycle: ListingLifecycle,
): ListingStatusTone {
    if (lifecycle === "WITHDRAWN") return "ended";
    if (!availability || availability === "UNKNOWN") return "unknown";
    if (availability === "RESERVED") return "reserved";
    if (ENDED.includes(availability)) return "ended";
    return "offered";
}

export function ListingStatusPill({
    availability,
    lifecycle,
    className,
}: {
    readonly availability: ListingAvailability | null;
    readonly lifecycle: ListingLifecycle;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const tone = getListingStatusTone(availability, lifecycle);
    const muted = tone === "ended" || tone === "unknown";

    return (
        <span
            data-tone={tone}
            className={cn(
                "inline-flex h-7 items-center gap-2 rounded-pill px-3 font-mono text-tag leading-none tracking-[0.14em] uppercase",
                muted
                    ? "text-ink-muted shadow-[inset_0_0_0_1px_var(--color-line)]"
                    : "text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
                className,
            )}
        >
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
            {t(getListingStatusLabelKey(availability, lifecycle))}
        </span>
    );
}
