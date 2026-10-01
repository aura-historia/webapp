import type { OwnUserAccountData, PatchUserAccountData } from "@/client";
import { type Language, parseLanguage, mapToBackendLanguage } from "../common/Language.ts";
import { type Currency, parseCurrency, mapToBackendCurrency } from "../common/Currency.ts";
import { type UnitSystem, parseUnitSystem, mapToBackendUnitSystem } from "../common/UnitSystem.ts";
import { type UserRole, parseUserRole } from "./UserRole.ts";
import {
    parseSubscriptionType,
    type SubscriptionType,
} from "@/data/internal/account/SubscriptionType.ts";

export type UserAccountData = {
    readonly userId: string;
    readonly email: string;
    readonly firstName?: string | null;
    readonly lastName?: string | null;
    readonly language?: Language | null;
    readonly currency?: Currency | null;
    readonly unitSystem?: UnitSystem | null;
    readonly showUnassessedOrSensitiveContent: boolean;
    readonly role: UserRole;
    readonly subscriptionType: SubscriptionType;
    readonly stripeCustomerId?: string | null;
};

export type UserAccountPatchData = {
    readonly firstName?: string | null;
    readonly lastName?: string | null;
    readonly language?: Language | null;
    readonly currency?: Currency | null;
    readonly unitSystem?: UnitSystem | null;
    readonly showUnassessedOrSensitiveContent?: boolean;
};

export function mapToInternalUserAccount(apiData: OwnUserAccountData): UserAccountData {
    return {
        userId: apiData.userId,
        email: apiData.email,
        firstName: apiData.firstName,
        lastName: apiData.lastName,
        language: apiData.language == null ? apiData.language : parseLanguage(apiData.language),
        currency: apiData.currency == null ? apiData.currency : parseCurrency(apiData.currency),
        unitSystem:
            apiData.measurementUnit == null
                ? apiData.measurementUnit
                : parseUnitSystem(apiData.measurementUnit),
        showUnassessedOrSensitiveContent: apiData.showUnassessedOrSensitiveContent,
        role: parseUserRole(apiData.role),
        subscriptionType: parseSubscriptionType(apiData.tier),
        stripeCustomerId: apiData.stripeCustomerId,
    };
}

export function mapToBackendUserAccountPatch(data: UserAccountPatchData): PatchUserAccountData {
    if (
        data.showUnassessedOrSensitiveContent !== undefined &&
        typeof data.showUnassessedOrSensitiveContent !== "boolean"
    ) {
        throw new TypeError("Content visibility must be a boolean or omitted");
    }
    return {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.language !== undefined && {
            language: mapToBackendLanguage(data.language ?? undefined),
        }),
        ...(data.currency !== undefined && {
            currency: mapToBackendCurrency(data.currency ?? undefined),
        }),
        ...(data.unitSystem !== undefined && {
            measurementUnit: mapToBackendUnitSystem(data.unitSystem ?? undefined),
        }),
        ...(data.showUnassessedOrSensitiveContent !== undefined && {
            showUnassessedOrSensitiveContent: data.showUnassessedOrSensitiveContent,
        }),
    };
}
