import type {
    CurrencyData,
    GetUserAccountData,
    LanguageData,
    PatchAdminUserData,
    UserRoleData,
    UserTierData,
} from "@/client";
import {
    mapToBackendCurrency,
    parseCurrency,
    type Currency,
} from "@/data/internal/common/Currency.ts";
import {
    mapToBackendLanguage,
    parseLanguage,
    type Language,
} from "@/data/internal/common/Language.ts";
import {
    mapToBackendUserRole,
    parseUserRole,
    type UserRole,
} from "@/data/internal/account/UserRole.ts";

export const USER_TIERS = ["FREE", "PRO", "ULTIMATE"] as const;
export type UserTier = (typeof USER_TIERS)[number];

export type AdminUser = {
    readonly userId: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly language?: Language;
    readonly currency?: Currency;
    readonly prohibitedContentConsent: boolean;
    readonly tier: UserTier;
    readonly role: UserRole;
    readonly stripeCustomerId?: string;
    readonly created: Date;
    readonly updated: Date;
};

export type AdminUserPatch = {
    readonly userId: string;
    readonly firstName?: string | null;
    readonly lastName?: string | null;
    readonly language?: Language | null;
    readonly currency?: Currency | null;
    readonly prohibitedContentConsent?: boolean | null;
    readonly tier?: UserTier | null;
    readonly role?: UserRole | null;
    readonly stripeCustomerId?: string | null;
};

export function parseUserTier(tier?: string): UserTier {
    return USER_TIERS.includes(tier as UserTier) ? (tier as UserTier) : "FREE";
}

export function mapToBackendUserTier(tier: UserTier): UserTierData {
    return tier;
}

export function mapToAdminUser(data: GetUserAccountData): AdminUser {
    return {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        language: data.language ? parseLanguage(data.language) : undefined,
        currency: data.currency ? parseCurrency(data.currency) : undefined,
        prohibitedContentConsent: data.prohibitedContentConsent,
        tier: parseUserTier(data.tier),
        role: parseUserRole(data.role),
        stripeCustomerId: data.stripeCustomerId ?? undefined,
        created: new Date(data.created),
        updated: new Date(data.updated),
    };
}

export function mapToAdminUserPatch(data: Omit<AdminUserPatch, "userId">): PatchAdminUserData {
    const body: PatchAdminUserData = {};
    if (data.firstName !== undefined) body.firstName = data.firstName;
    if (data.lastName !== undefined) body.lastName = data.lastName;
    if (data.language !== undefined) {
        body.language =
            data.language === null ? null : (mapToBackendLanguage(data.language) as LanguageData);
    }
    if (data.currency !== undefined) {
        body.currency =
            data.currency === null ? null : (mapToBackendCurrency(data.currency) as CurrencyData);
    }
    if (data.prohibitedContentConsent !== undefined) {
        body.prohibitedContentConsent = data.prohibitedContentConsent;
    }
    if (data.tier !== undefined) {
        body.tier = data.tier === null ? null : mapToBackendUserTier(data.tier);
    }
    if (data.role !== undefined) {
        body.role = data.role === null ? null : (mapToBackendUserRole(data.role) as UserRoleData);
    }
    if (data.stripeCustomerId !== undefined) body.stripeCustomerId = data.stripeCustomerId;
    return body;
}
