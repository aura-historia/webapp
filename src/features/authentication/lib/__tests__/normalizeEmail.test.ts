import { describe, expect, it } from "vitest";

import { normalizeEmail } from "../normalizeEmail";

describe("normalizeEmail", () => {
    it("lowercases the address so it matches the case-sensitive Cognito username", () => {
        expect(normalizeEmail("User@Example.com")).toBe("user@example.com");
        expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    });

    it("strips surrounding whitespace left by autofill and copy-paste", () => {
        expect(normalizeEmail("  User@Example.com \n")).toBe("user@example.com");
    });

    it("leaves an already normalized address untouched", () => {
        expect(normalizeEmail("user@example.com")).toBe("user@example.com");
    });

    it("keeps an empty value empty rather than inventing an address", () => {
        expect(normalizeEmail("   ")).toBe("");
    });
});
