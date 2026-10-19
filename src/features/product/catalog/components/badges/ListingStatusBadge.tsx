import type {
    ListingAvailability,
    ListingLifecycle,
} from "@/data/internal/product/ProductListingDomain.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

const AVAILABILITY_KEYS: Partial<Record<ListingAvailability, string>> = {
    AVAILABLE: "available",
    IN_STOCK: "inStock",
    LIMITED_AVAILABILITY: "limitedAvailability",
    BACK_ORDER: "backOrder",
    MADE_TO_ORDER: "madeToOrder",
    PRE_ORDER: "preOrder",
    PRE_SALE: "preSale",
    UNAVAILABLE: "unavailable",
    RESERVED: "reserved",
    OUT_OF_STOCK: "outOfStock",
    SOLD_OUT: "soldOut",
};

/** Translation key of the status a listing shows: withdrawn, its availability, or not reported. */
export function getListingStatusLabelKey(
    availability: ListingAvailability | null,
    lifecycle: ListingLifecycle,
): string {
    if (lifecycle === "WITHDRAWN") return "product.listingAvailability.withdrawn";
    const key = availability ? AVAILABILITY_KEYS[availability] : undefined;
    return key ? `product.listingAvailability.${key}` : "product.listingAvailability.unknown";
}

export function ListingStatusBadge({
    availability,
    lifecycle,
    className,
}: {
    readonly availability: ListingAvailability | null;
    readonly lifecycle: ListingLifecycle;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const label = t(getListingStatusLabelKey(availability, lifecycle));

    if (!label) return null;

    return (
        <Badge
            variant="outline"
            className={cn(
                "rounded-none border border-outline-variant/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                className,
            )}
        >
            {label}
        </Badge>
    );
}
