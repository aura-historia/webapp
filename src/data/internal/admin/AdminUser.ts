import type {
    AdminUserAccountData,
    AdminUserSummaryData,
    PatchAdminUserData,
    SortUserFieldData,
    UserRoleData,
    UserTierData,
} from "@/client";
import { type Currency, mapToBackendCurrency, parseCurrency } from "../common/Currency.ts";
import { type Language, mapToBackendLanguage, parseLanguage } from "../common/Language.ts";
import { type UnitSystem, mapToBackendUnitSystem, parseUnitSystem } from "../common/UnitSystem.ts";
import { type UserRole, mapToBackendUserRole, parseUserRole } from "../account/UserRole.ts";
import {
    type SubscriptionType,
    mapToBackendUserTier,
    parseSubscriptionType,
} from "../account/SubscriptionType.ts";

export type AdminUserSortField = SortUserFieldData;
export type AdminUserRole = UserRoleData;
export type AdminUserTier = UserTierData;

export type AdminUserSummary = {
    readonly userId: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly role: UserRole;
    readonly tier: SubscriptionType;
};

export type AdminUserAccount = {
    readonly userId: string;
    readonly email: string;
    readonly firstName?: string | null;
    readonly lastName?: string | null;
    readonly language?: Language | null;
    readonly currency?: Currency | null;
    readonly measurementUnit?: UnitSystem | null;
    readonly showUnassessedOrSensitiveContent: boolean;
    readonly role: UserRole;
    readonly tier: SubscriptionType;
};

export type AdminUserProfileFormValues = {
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly language: Language | "";
    readonly currency: Currency | "";
    readonly measurementUnit: UnitSystem | "";
    readonly showUnassessedOrSensitiveContent: boolean;
};

export type AdminUserProfilePatch = Omit<PatchAdminUserData, "role" | "tier">;

/** Search summaries deliberately map only fields the search contract provides. */
export function mapToAdminUserSummary(apiData: AdminUserSummaryData): AdminUserSummary {
    return {
        userId: apiData.userId,
        email: apiData.email,
        ...(apiData.firstName !== undefined && { firstName: apiData.firstName }),
        ...(apiData.lastName !== undefined && { lastName: apiData.lastName }),
        role: parseUserRole(apiData.role),
        tier: parseSubscriptionType(apiData.tier),
    };
}

/** Detail maps only documented account fields; it does not invent audit or address values. */
export function mapToAdminUserAccount(apiData: AdminUserAccountData): AdminUserAccount {
    return {
        userId: apiData.userId,
        email: apiData.email,
        firstName: apiData.firstName,
        lastName: apiData.lastName,
        language: apiData.language == null ? apiData.language : parseLanguage(apiData.language),
        currency: apiData.currency == null ? apiData.currency : parseCurrency(apiData.currency),
        measurementUnit:
            apiData.measurementUnit == null
                ? apiData.measurementUnit
                : parseUnitSystem(apiData.measurementUnit),
        showUnassessedOrSensitiveContent: apiData.showUnassessedOrSensitiveContent,
        role: parseUserRole(apiData.role),
        tier: parseSubscriptionType(apiData.tier),
    };
}

export function toAdminUserProfileFormValues(
    account: AdminUserAccount,
): AdminUserProfileFormValues {
    return {
        email: account.email,
        firstName: account.firstName ?? "",
        lastName: account.lastName ?? "",
        language: account.language ?? "",
        currency: account.currency ?? "",
        measurementUnit: account.measurementUnit ?? "",
        showUnassessedOrSensitiveContent: account.showUnassessedOrSensitiveContent,
    };
}

/** Produces profile/preferences fields only, omitting values that have not changed. */
export function mapToAdminUserProfilePatch(
    account: AdminUserAccount,
    values: AdminUserProfileFormValues,
): AdminUserProfilePatch {
    const patch: AdminUserProfilePatch = {};
    const email = values.email.trim();
    const firstName = values.firstName.trim() || null;
    const lastName = values.lastName.trim() || null;
    const language = mapToBackendLanguage(values.language || undefined);
    const currency = mapToBackendCurrency(values.currency || undefined);
    const measurementUnit = mapToBackendUnitSystem(values.measurementUnit || undefined);

    if (email !== account.email) patch.email = email;
    if (firstName !== (account.firstName ?? null)) patch.firstName = firstName;
    if (lastName !== (account.lastName ?? null)) patch.lastName = lastName;
    if (language !== (account.language ?? null)) patch.language = language;
    if (currency !== (account.currency ?? null)) patch.currency = currency;
    if (measurementUnit !== (account.measurementUnit ?? null)) {
        patch.measurementUnit = measurementUnit;
    }
    if (values.showUnassessedOrSensitiveContent !== account.showUnassessedOrSensitiveContent) {
        patch.showUnassessedOrSensitiveContent = values.showUnassessedOrSensitiveContent;
    }

    return patch;
}

export function mapToAdminUserRolePatch(role: UserRole): Pick<PatchAdminUserData, "role"> {
    return { role: mapToBackendUserRole(role) };
}

export function mapToAdminUserTierPatch(tier: SubscriptionType): Pick<PatchAdminUserData, "tier"> {
    const mappedTier = mapToBackendUserTier(tier);
    if (!mappedTier) throw new TypeError("A valid user tier is required");
    return { tier: mappedTier };
}
