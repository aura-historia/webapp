import { beforeEach, describe, expect, it, vi } from "vitest";

const i18nMock = vi.hoisted(() => ({
    exists: vi.fn<(key: string) => boolean>(),
    t: vi.fn<(key: string) => string>(),
}));

vi.mock("@/i18n/i18n.ts", () => ({
    default: i18nMock,
}));

import { getCategoryDescription, resolveCategoryDescriptionKey } from "../categoryDescription.ts";

const DEFAULT_KEY = "category.descriptions.default";

function setExistingKeys(keys: string[]) {
    const keySet = new Set(keys);
    i18nMock.exists.mockImplementation((key: string) => keySet.has(key));
}

describe("categoryDescription", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        i18nMock.t.mockImplementation((key: string) => `translated:${key}`);
        setExistingKeys([]);
    });

    it("uses default description key when identifier is missing", () => {
        expect(resolveCategoryDescriptionKey(undefined)).toBe(DEFAULT_KEY);
    });

    it("uses raw category key when it exists", () => {
        setExistingKeys(["category.descriptions.ANCIENT_POTTERY"]);

        expect(resolveCategoryDescriptionKey("ANCIENT_POTTERY")).toBe(
            "category.descriptions.ANCIENT_POTTERY",
        );
    });

    it("normalizes slug-like identifiers before lookup", () => {
        setExistingKeys(["category.descriptions.ANCIENT_POTTERY"]);

        expect(resolveCategoryDescriptionKey("ancient-pottery")).toBe(
            "category.descriptions.ANCIENT_POTTERY",
        );
    });

    it("falls back to default key when normalized identifier is empty", () => {
        expect(resolveCategoryDescriptionKey("---")).toBe(DEFAULT_KEY);
    });

    it("translates using the resolved key", () => {
        setExistingKeys(["category.descriptions.ANCIENT_POTTERY"]);

        expect(getCategoryDescription("ancient-pottery")).toBe(
            "translated:category.descriptions.ANCIENT_POTTERY",
        );
        expect(i18nMock.t).toHaveBeenCalledWith("category.descriptions.ANCIENT_POTTERY");
    });
});
