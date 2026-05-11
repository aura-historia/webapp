import type { GetUserAccountData, PatchAdminUserData, UserTierData } from "@/client";
import {
    type Currency,
    mapToBackendCurrency,
    parseCurrency,
} from "@/data/internal/common/Currency.ts";
import {
    type Language,
    mapToBackendLanguage,
    parseLanguage,
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
    return {
        ...(data.firstName !== undefined ? { firstName: data.firstName } : {}),
        ...(data.lastName !== undefined ? { lastName: data.lastName } : {}),
        ...(data.language !== undefined
            ? {
                  language: data.language === null ? null : mapToBackendLanguage(data.language),
              }
            : {}),
        ...(data.currency !== undefined
            ? {
                  currency: data.currency === null ? null : mapToBackendCurrency(data.currency),
              }
            : {}),
        ...(data.prohibitedContentConsent !== undefined
            ? { prohibitedContentConsent: data.prohibitedContentConsent }
            : {}),
        ...(data.tier !== undefined
            ? { tier: data.tier === null ? null : mapToBackendUserTier(data.tier) }
            : {}),
        ...(data.role !== undefined
            ? {
                  role: data.role === null ? null : mapToBackendUserRole(data.role),
              }
            : {}),
        ...(data.stripeCustomerId !== undefined ? { stripeCustomerId: data.stripeCustomerId } : {}),
    };
}
