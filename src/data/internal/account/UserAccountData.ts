import type { GetUserAccountData, PatchUserAccountData } from "@/client";
import { type Language, parseLanguage, mapToBackendLanguage } from "../common/Language.ts";
import { type Currency, parseCurrency, mapToBackendCurrency } from "../common/Currency.ts";
import { type UserRole, parseUserRole } from "./UserRole.ts";
import { type SubscriptionType, parseSubscriptionType } from "./SubscriptionType.ts";

export type UserAccountData = {
    readonly userId: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly language?: Language;
    readonly currency?: Currency;
    readonly prohibitedContentConsent: boolean;
    readonly role: UserRole;
    readonly subscriptionType: SubscriptionType;
    readonly created: Date;
    readonly updated: Date;
};

export type UserAccountPatchData = {
    readonly firstName?: string;
    readonly lastName?: string;
    readonly language?: Language;
    readonly currency?: Currency;
    readonly prohibitedContentConsent?: boolean;
};

export function mapToInternalUserAccount(apiData: GetUserAccountData): UserAccountData {
    return {
        userId: apiData.userId,
        email: apiData.email,
        firstName: apiData.firstName ?? undefined,
        lastName: apiData.lastName ?? undefined,
        language: apiData.language ? parseLanguage(apiData.language) : undefined,
        currency: apiData.currency ? parseCurrency(apiData.currency) : undefined,
        prohibitedContentConsent: apiData.prohibitedContentConsent,
        role: parseUserRole(apiData.role),
        subscriptionType: parseSubscriptionType(apiData.tier),
        created: new Date(apiData.created),
        updated: new Date(apiData.updated),
    };
}

export function mapToBackendUserAccountPatch(data: UserAccountPatchData): PatchUserAccountData {
    return {
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        language: mapToBackendLanguage(data.language),
        currency: mapToBackendCurrency(data.currency),
        prohibitedContentConsent: data.prohibitedContentConsent ?? null,
    };
}
