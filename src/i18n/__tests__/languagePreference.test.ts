import { describe, expect, it } from "vitest";
import {
    LANGUAGE_PREFERENCE_MAX_AGE_SECONDS,
    serializeLanguagePreferenceCookie,
} from "@/i18n/languagePreference.ts";

describe("language preference", () => {
    it("serializes a persistent first-party language cookie", () => {
        expect(serializeLanguagePreferenceCookie("fr", true)).toBe(
            `aura-language=fr; Path=/; Max-Age=${LANGUAGE_PREFERENCE_MAX_AGE_SECONDS}; SameSite=Lax; Secure`,
        );
    });

    it("does not serialize unsupported languages", () => {
        expect(serializeLanguagePreferenceCookie("nl", true)).toBeUndefined();
    });
});
