import type { GetUserAccountData, PatchUserAccountData } from "@/client";
import { type Language, parseLanguage, mapToBackendLanguage } from "./Language";
import { type Currency, parseCurrency, mapToBackendCurrency } from "./Currency";

export type UserAccountData = {
    readonly userId: string;
    readonly email: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly language?: Language;
    readonly currency?: Currency;
    readonly created: Date;
    readonly updated: Date;
};

export type UserAccountPatchData = {
    readonly firstName?: string;
    readonly lastName?: string;
    readonly language?: Language;
    readonly currency?: Currency;
};

export function mapToInternalUserAccount(apiData: GetUserAccountData): UserAccountData {
    return {
        userId: apiData.userId,
        email: apiData.email,
        firstName: apiData.firstName ?? undefined,
        lastName: apiData.lastName ?? undefined,
        language: apiData.language ? parseLanguage(apiData.language) : undefined,
        currency: apiData.currency ? parseCurrency(apiData.currency) : undefined,
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
    };
}
