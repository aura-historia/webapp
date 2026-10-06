import type { PutNewsletterSubscriptionData } from "@/client";
import { type Language, mapToBackendLanguage } from "@/data/internal/common/Language.ts";
import { type Currency, mapToBackendCurrency } from "@/data/internal/common/Currency.ts";

export type NewsletterSubscription = {
    readonly email: string;
    readonly firstName?: string | null;
    readonly lastName?: string | null;
    readonly language?: Language | null;
    readonly currency?: Currency | null;
};

export function mapToBackendNewsletterSubscription(
    data: NewsletterSubscription,
): PutNewsletterSubscriptionData {
    return {
        email: data.email,
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.language !== undefined && {
            language: mapToBackendLanguage(data.language ?? undefined),
        }),
        ...(data.currency !== undefined && {
            currency: mapToBackendCurrency(data.currency ?? undefined),
        }),
    };
}
