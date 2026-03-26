import { describe, expect, it } from "vitest";
import type { GetPeriodSummaryData } from "@/client";
import { mapToPeriodOverview } from "../PeriodOverview.ts";

const mockPeriodSummaryData: GetPeriodSummaryData = {
    periodId: "renaissance",
    periodKey: "RENAISSANCE",
    name: { text: "Renaissance", language: "en" },
    created: "2024-01-15T08:00:00Z",
    updated: "2024-06-20T12:30:00Z",
};

describe("mapToPeriodOverview", () => {
    it("extracts the text from the localized name field", () => {
        const result = mapToPeriodOverview(mockPeriodSummaryData);
        expect(result.name).toBe("Renaissance");
    });

    it("passes periodId through unchanged", () => {
        const result = mapToPeriodOverview(mockPeriodSummaryData);
        expect(result.periodId).toBe("renaissance");
    });

    it("passes periodKey through unchanged", () => {
        const result = mapToPeriodOverview(mockPeriodSummaryData);
        expect(result.periodKey).toBe("RENAISSANCE");
    });

    it("does not include description, created, or updated fields", () => {
        const result = mapToPeriodOverview(mockPeriodSummaryData);
        expect(result).not.toHaveProperty("description");
        expect(result).not.toHaveProperty("created");
        expect(result).not.toHaveProperty("updated");
    });
});
