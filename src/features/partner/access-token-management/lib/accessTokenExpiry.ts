import { useEffect, useState } from "react";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";

/** A token counts as expiring soon within this many days of its expiry. */
export const EXPIRING_SOON_DAYS = 14;

const EXPIRING_SOON_MS = EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000;

export type AccessTokenExpiryState = "none" | "later" | "soon" | "expired";

/**
 * Where a token stands against the clock. Without a clock reading (`now` is null, as during
 * server render and before mount) a dated token reads as valid, so the markup stays deterministic.
 */
export function getAccessTokenExpiryState(
    accessToken: AccessToken,
    now: number | null,
): AccessTokenExpiryState {
    if (accessToken.expiresAt === null) return "none";
    if (now === null) return "later";
    const remaining = accessToken.expiresAt.getTime() - now;
    if (remaining <= 0) return "expired";
    return remaining <= EXPIRING_SOON_MS ? "soon" : "later";
}

/** Reads the clock after mount and again whenever `refreshKey` changes (e.g. a refetch). */
export function useClientNow(refreshKey: unknown): number | null {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        if (refreshKey !== 0) setNow(Date.now());
    }, [refreshKey]);
    return now;
}

export type AccessTokenWithExpiry = {
    readonly accessToken: AccessToken;
    readonly expiry: AccessTokenExpiryState;
};

/** Valid tokens first, then by name: the order of the access token lists. */
export function sortAccessTokens(
    accessTokens: readonly AccessToken[],
    now: number | null,
    locale: string,
): AccessTokenWithExpiry[] {
    return accessTokens
        .map((accessToken) => ({
            accessToken,
            expiry: getAccessTokenExpiryState(accessToken, now),
        }))
        .sort(
            (first, second) =>
                Number(first.expiry === "expired") - Number(second.expiry === "expired") ||
                first.accessToken.name.localeCompare(second.accessToken.name, locale),
        );
}
