import type { ListingAvailabilityData, ListingLifecycleData } from "@/client";
import { Badge } from "@/components/ui/badge.tsx";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

const AVAILABILITY_KEYS: Record<ListingAvailabilityData, string> = {
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

export function ListingStatusBadge({
    availability,
    lifecycle,
    className,
}: {
    readonly availability: ListingAvailabilityData | null;
    readonly lifecycle: ListingLifecycleData;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const label =
        lifecycle === "WITHDRAWN"
            ? t("product.listingAvailability.withdrawn")
            : availability
              ? t(`product.listingAvailability.${AVAILABILITY_KEYS[availability]}`)
              : undefined;

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
