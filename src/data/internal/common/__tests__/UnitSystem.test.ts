import { describe, expect, it } from "vitest";
import {
    UNIT_SYSTEMS,
    inferUnitSystemFromLocale,
    mapToBackendUnitSystem,
    parseUnitSystem,
} from "../UnitSystem.ts";

describe("UNIT_SYSTEMS", () => {
    it("should contain both supported unit systems", () => {
        expect(UNIT_SYSTEMS).toHaveLength(2);
        expect(UNIT_SYSTEMS).toEqual(["METRIC", "IMPERIAL"]);
    });
});

describe("parseUnitSystem", () => {
    it("should return METRIC for undefined", () => {
        expect(parseUnitSystem(undefined)).toBe("METRIC");
    });

    it("should return METRIC for empty string", () => {
        expect(parseUnitSystem("")).toBe("METRIC");
    });

    it("should return METRIC for unknown unit system", () => {
        expect(parseUnitSystem("XYZ")).toBe("METRIC");
    });

    it("should handle mixed case input", () => {
        expect(parseUnitSystem("imperial")).toBe("IMPERIAL");
        expect(parseUnitSystem("metric")).toBe("METRIC");
    });
});

describe("mapToBackendUnitSystem", () => {
    it("should return null for undefined", () => {
        expect(mapToBackendUnitSystem(undefined)).toBeNull();
    });

    it("should return the backend value for a valid unit system", () => {
        expect(mapToBackendUnitSystem("IMPERIAL")).toBe("IMPERIAL");
    });
});

describe("inferUnitSystemFromLocale", () => {
    it("should infer METRIC for German locale", () => {
        expect(inferUnitSystemFromLocale("de")).toBe("METRIC");
    });

    it("should infer METRIC for British English locale", () => {
        expect(inferUnitSystemFromLocale("en-GB")).toBe("METRIC");
    });

    it("should infer IMPERIAL for US English locale", () => {
        expect(inferUnitSystemFromLocale("en-US")).toBe("IMPERIAL");
    });

    it("should infer IMPERIAL for Liberian locale", () => {
        expect(inferUnitSystemFromLocale("en-LR")).toBe("IMPERIAL");
    });

    it("should infer IMPERIAL for Myanmar locale", () => {
        expect(inferUnitSystemFromLocale("my-MM")).toBe("IMPERIAL");
    });

    it("should fall back to METRIC for invalid locale", () => {
        expect(inferUnitSystemFromLocale("not-a-locale-string!!")).toBe("METRIC");
    });
});
