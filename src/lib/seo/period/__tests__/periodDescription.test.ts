import { beforeEach, describe, expect, it, vi } from "vitest";

const i18nMock = vi.hoisted(() => ({
    exists: vi.fn<(key: string) => boolean>(),
    t: vi.fn<(key: string) => string>(),
}));

vi.mock("@/i18n/i18n.ts", () => ({
    default: i18nMock,
}));

import { getPeriodDescription, resolvePeriodDescriptionKey } from "../periodDescription.ts";

const DEFAULT_KEY = "period.header.defaultDescription";

function setExistingKeys(keys: string[]) {
    const keySet = new Set(keys);
    i18nMock.exists.mockImplementation((key: string) => keySet.has(key));
}

describe("periodDescription", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        i18nMock.t.mockImplementation((key: string) => `translated:${key}`);
        setExistingKeys([]);
    });

    it("uses default description key when identifier is missing", () => {
        expect(resolvePeriodDescriptionKey(undefined)).toBe(DEFAULT_KEY);
    });

    it("uses raw period key when it exists", () => {
        setExistingKeys(["period.descriptions.EARLY_MODERN"]);

        expect(resolvePeriodDescriptionKey("EARLY_MODERN")).toBe(
            "period.descriptions.EARLY_MODERN",
        );
    });

    it("normalizes slug-like identifiers before lookup", () => {
        setExistingKeys(["period.descriptions.EARLY_MODERN"]);

        expect(resolvePeriodDescriptionKey("early-modern")).toBe(
            "period.descriptions.EARLY_MODERN",
        );
    });

    it("falls back to default key when normalized identifier is empty", () => {
        expect(resolvePeriodDescriptionKey("---")).toBe(DEFAULT_KEY);
    });

    it("translates using the resolved key", () => {
        setExistingKeys(["period.descriptions.EARLY_MODERN"]);

        expect(getPeriodDescription("early-modern")).toBe(
            "translated:period.descriptions.EARLY_MODERN",
        );
        expect(i18nMock.t).toHaveBeenCalledWith("period.descriptions.EARLY_MODERN");
    });
});
