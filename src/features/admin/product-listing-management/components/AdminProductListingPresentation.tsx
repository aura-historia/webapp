import { type ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AdminMarkTone } from "@/features/admin/common/components/AdminStatusMark.tsx";
import { FIELD_ERROR_CLASS, FIELD_LABEL_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { formatPrice } from "@/data/internal/price/Price.ts";
import { LISTING_AVAILABILITY_TRANSLATION_KEYS } from "@/data/internal/product/ListingAvailability.ts";
import type {
    ListingAvailability,
    ListingLifecycle,
    ListingPrice,
} from "@/data/internal/product/ProductListingDomain.ts";
import { cn, formatDateTime } from "@/lib/utils.ts";

/** Active listings carry the ink mark, withdrawn ones the hollow mark. */
export function lifecycleTone(lifecycle: ListingLifecycle): AdminMarkTone {
    if (lifecycle === "ACTIVE") return "ink";
    if (lifecycle === "WITHDRAWN") return "hollow";
    return "dashed";
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
    return (price: ListingPrice | null): string | undefined => {
        if (price === null) return undefined;
        if (price.type === "ON_REQUEST") return t("adminProductListings.priceOptions.ON_REQUEST");
        return formatPrice(price, i18n.language);
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

/** A labelled form control with its translated validation message. */
export function FormField({
    id,
    label,
    error,
    className,
    children,
}: {
    readonly id: string;
    readonly label: ReactNode;
    /** A translation key from the form schema. */
    readonly error?: string;
    readonly className?: string;
    readonly children: ReactNode;
}) {
    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <label
                htmlFor={id}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {label}
            </label>
            {children}
            <FormFieldError id={`${id}-error`} message={error} />
        </div>
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
        <p id={id} className={FIELD_ERROR_CLASS}>
            {t(message)}
        </p>
    );
}

/** Names a UTC time field: the label, then a small mono "UTC". */
export function UtcLabel({ children }: { readonly children: ReactNode }) {
    return (
        <>
            {children}{" "}
            <span className="font-mono text-[10px] font-normal tracking-[0.1em] text-ink-muted">
                UTC
            </span>
        </>
    );
}

/** Names a language code in the page language ("Deutsch", "English"), falling back to the code. */
export function useLanguageNames() {
    const { i18n } = useTranslation();
    return useMemo(() => {
        try {
            const names = new Intl.DisplayNames([i18n.language], { type: "language" });
            return (code: string) => names.of(code) ?? code.toUpperCase();
        } catch {
            return (code: string) => code.toUpperCase();
        }
    }, [i18n.language]);
}
