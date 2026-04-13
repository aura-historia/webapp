import { describe, expect, it, vi } from "vitest";
import {
    getCombinationDescription,
    getCombinationDescriptionKey,
} from "../combinationDescription.ts";

vi.mock("@/i18n/i18n.ts", () => ({
    default: {
        exists: (key: string) => key === "combination.descriptions.biedermeier-moebel",
        t: (key: string) => {
            if (key === "combination.descriptions.biedermeier-moebel") {
                return "Sammler, die nach authentischen Biedermeier-Möbeln suchen.";
            }
            if (key === "combination.descriptions.default") {
                return "Entdecken Sie sorgfältig kuratierte Objekte dieser Sammlung.";
            }
            return key;
        },
    },
}));

describe("combinationDescription", () => {
    describe("getCombinationDescriptionKey", () => {
        it("returns the specific key when the slug exists in i18n", () => {
            expect(getCombinationDescriptionKey("biedermeier-moebel")).toBe(
                "combination.descriptions.biedermeier-moebel",
            );
        });

        it("returns the default key when the slug does not exist", () => {
            expect(getCombinationDescriptionKey("non-existent")).toBe(
                "combination.descriptions.default",
            );
        });

        it("returns the default key when slug is undefined", () => {
            expect(getCombinationDescriptionKey(undefined)).toBe(
                "combination.descriptions.default",
            );
        });
    });

    describe("getCombinationDescription", () => {
        it("returns the translated description for a known slug", () => {
            expect(getCombinationDescription("biedermeier-moebel")).toBe(
                "Sammler, die nach authentischen Biedermeier-Möbeln suchen.",
            );
        });

        it("returns the default description for an unknown slug", () => {
            expect(getCombinationDescription("unknown")).toBe(
                "Entdecken Sie sorgfältig kuratierte Objekte dieser Sammlung.",
            );
        });
    });
});
