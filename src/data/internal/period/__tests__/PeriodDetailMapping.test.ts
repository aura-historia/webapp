import { describe, expect, it } from "vitest";
import type { GetPeriodData } from "@/client";
import { mapToPeriodDetail } from "../PeriodDetail.ts";

const mockPeriodData: GetPeriodData = {
    periodId: "renaissance",
    periodKey: "RENAISSANCE",
    name: { text: "Renaissance", language: "en" },
    products: 200,
    created: "2024-01-15T08:00:00Z",
    updated: "2024-06-20T12:30:00Z",
};

describe("mapToPeriodDetail", () => {
    it("extracts the text from the localized name field", () => {
        const result = mapToPeriodDetail(mockPeriodData);
        expect(result.name).toBe("Renaissance");
    });

    it("passes periodId and periodKey through unchanged", () => {
        const result = mapToPeriodDetail(mockPeriodData);
        expect(result.periodId).toBe("renaissance");
        expect(result.periodKey).toBe("RENAISSANCE");
    });

    it("parses the created date string into a Date object", () => {
        const result = mapToPeriodDetail(mockPeriodData);
        expect(result.created).toBeInstanceOf(Date);
        expect(result.created.toISOString()).toBe("2024-01-15T08:00:00.000Z");
    });

    it("parses the updated date string into a Date object", () => {
        const result = mapToPeriodDetail(mockPeriodData);
        expect(result.updated).toBeInstanceOf(Date);
        expect(result.updated.toISOString()).toBe("2024-06-20T12:30:00.000Z");
    });
});
