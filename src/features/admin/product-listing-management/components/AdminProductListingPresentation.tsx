import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import { formatPrice } from "@/data/internal/price/Price.ts";
import { LISTING_AVAILABILITY_TRANSLATION_KEYS } from "@/data/internal/product/ListingAvailability.ts";
import type {
    ListingAvailability,
    ListingLifecycle,
    ListingPrice,
    ListingPriceEstimate,
} from "@/data/internal/product/ProductListingDomain.ts";
import { formatDateTime } from "@/lib/utils.ts";

export function AdminProductListingLifecycleBadge({
    lifecycle,
}: {
    readonly lifecycle: ListingLifecycle;
}) {
    const { t } = useTranslation();
    return (
        <Badge variant={lifecycle === "ACTIVE" ? "secondary" : "outline"}>
            {t(`adminProductListings.lifecycles.${lifecycle}`)}
        </Badge>
    );
}

/** Absent availability means no reliable current assertion, never "unavailable". */
export function useAvailabilityLabel() {
    const { t } = useTranslation();
    return (availability: ListingAvailability | null) => {
        if (availability === null) return t("adminProductListings.fields.notAsserted");
        if (availability === "UNKNOWN") return t("adminProductListings.fields.unrecognized");
        return t(LISTING_AVAILABILITY_TRANSLATION_KEYS[availability]);
    };
}

/** Source-currency amounts only; the admin view performs no conversion. */
export function useSourcePriceLabel() {
    const { t, i18n } = useTranslation();
    return {
        price: (price: ListingPrice | null) => {
            if (price === null) return t("adminProductListings.fields.notAsserted");
            if (price.type === "ON_REQUEST") return t("adminProductListings.priceKinds.ON_REQUEST");
            return formatPrice(price, i18n.language);
        },
        estimate: (min: ListingPriceEstimate | null, max: ListingPriceEstimate | null) => {
            if (min === null && max === null) return t("adminProductListings.fields.notAsserted");
            return t("adminProductListings.fields.estimateRange", {
                min: min ? formatPrice(min, i18n.language) : "–",
                max: max ? formatPrice(max, i18n.language) : "–",
            });
        },
    };
}

export function UtcDateTime({ value }: { readonly value: Date }) {
    const { i18n } = useTranslation();
    return (
        <time dateTime={value.toISOString()}>
            {formatDateTime(value, i18n.language, "UTC")} UTC
        </time>
    );
}

/** Renders a translated validation message key. */
export function FormFieldError({
    id,
    message,
}: {
    readonly id?: string;
    readonly message?: string;
}) {
    const { t } = useTranslation();
    if (!message) return null;
    return (
        <p id={id} role="alert" className="text-sm text-destructive">
            {t(message)}
        </p>
    );
}

export function ReadOnlyFact({
    label,
    children,
    mono = false,
}: {
    readonly label: string;
    readonly children: ReactNode;
    readonly mono?: boolean;
}) {
    return (
        <div className="grid min-w-0 gap-1">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
            <dd className={mono ? "break-all font-mono text-xs" : "break-words text-sm"}>
                {children}
            </dd>
        </div>
    );
}
