import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import {
    EXPIRING_SOON_DAYS,
    getAccessTokenExpiryState,
    sortAccessTokens,
    useClientNow,
} from "./accessTokenExpiry.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 8, 12, 0, 0);

function token(name: string, expiresAt: Date | null, id = name): AccessToken {
    return { id, name, scopes: [], expiresAt };
}

describe("getAccessTokenExpiryState", () => {
    it("reads a token without expiry as never expiring", () => {
        expect(getAccessTokenExpiryState(token("a", null), NOW)).toBe("none");
        expect(getAccessTokenExpiryState(token("a", null), null)).toBe("none");
    });

    it("reads a dated token as valid without a clock reading", () => {
        expect(getAccessTokenExpiryState(token("a", new Date(NOW - DAY)), null)).toBe("later");
        expect(getAccessTokenExpiryState(token("a", new Date(NOW + DAY)), null)).toBe("later");
    });

    it("reads a token beyond the warning window as valid", () => {
        expect(EXPIRING_SOON_DAYS).toBe(14);
        expect(getAccessTokenExpiryState(token("a", new Date(NOW + 14 * DAY + 1)), NOW)).toBe(
            "later",
        );
    });

    it("reads a token expiring within 14 days, inclusive, as soon", () => {
        expect(getAccessTokenExpiryState(token("a", new Date(NOW + 14 * DAY)), NOW)).toBe("soon");
        expect(getAccessTokenExpiryState(token("a", new Date(NOW + 1)), NOW)).toBe("soon");
    });

    it("reads a token at or past its expiry as expired", () => {
        expect(getAccessTokenExpiryState(token("a", new Date(NOW)), NOW)).toBe("expired");
        expect(getAccessTokenExpiryState(token("a", new Date(NOW - DAY)), NOW)).toBe("expired");
    });
});

describe("sortAccessTokens", () => {
    it("lists valid tokens first, each part by name, with their expiry states", () => {
        const sorted = sortAccessTokens(
            [
                token("Zeta", new Date(NOW - DAY)),
                token("beta", null),
                token("Alpha", new Date(NOW - 2 * DAY)),
                token("Gamma", new Date(NOW + 2 * DAY)),
                token("Älter", new Date(NOW + 30 * DAY)),
            ],
            NOW,
            "de",
        );

        expect(sorted.map(({ accessToken, expiry }) => [accessToken.name, expiry])).toEqual([
            ["Älter", "later"],
            ["beta", "none"],
            ["Gamma", "soon"],
            ["Alpha", "expired"],
            ["Zeta", "expired"],
        ]);
    });

    it("keeps every token in name order without a clock reading", () => {
        const sorted = sortAccessTokens(
            [token("b", new Date(NOW - DAY)), token("a", null)],
            null,
            "en",
        );

        expect(sorted.map(({ accessToken, expiry }) => [accessToken.name, expiry])).toEqual([
            ["a", "none"],
            ["b", "later"],
        ]);
    });

    it("does not reorder the given list", () => {
        const tokens = [token("b", null), token("a", null)];
        sortAccessTokens(tokens, NOW, "en");
        expect(tokens.map((entry) => entry.name)).toEqual(["b", "a"]);
    });
});

describe("useClientNow", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("reads the clock after data arrives and again on each refresh", () => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(NOW);
        const { result, rerender } = renderHook(({ key }) => useClientNow(key), {
            initialProps: { key: 0 },
        });
        expect(result.current).toBeNull();

        rerender({ key: 1 });
        expect(result.current).toBe(NOW);

        act(() => vi.setSystemTime(NOW + DAY));
        rerender({ key: 2 });
        expect(result.current).toBe(NOW + DAY);
    });
});
