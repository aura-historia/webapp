import { describe, expect, it } from "vitest";
import { mapToInternalAuctionWindow } from "../AuctionWindow.ts";

describe("mapToInternalAuctionWindow", () => {
    it("should map start and end to Date objects", () => {
        const result = mapToInternalAuctionWindow({
            start: "2025-06-01T10:00:00Z",
            end: "2025-06-01T18:00:00Z",
        });

        expect(result.start).toEqual(new Date("2025-06-01T10:00:00Z"));
        expect(result.end).toEqual(new Date("2025-06-01T18:00:00Z"));
    });

    it("should map only start when end is absent", () => {
        const result = mapToInternalAuctionWindow({ start: "2025-06-01T10:00:00Z" });

        expect(result.start).toEqual(new Date("2025-06-01T10:00:00Z"));
        expect(result.end).toBeUndefined();
    });

    it("should map only end when start is absent", () => {
        const result = mapToInternalAuctionWindow({ end: "2025-06-01T18:00:00Z" });

        expect(result.start).toBeUndefined();
        expect(result.end).toEqual(new Date("2025-06-01T18:00:00Z"));
    });

    it("should map null fields to undefined", () => {
        const result = mapToInternalAuctionWindow({ start: null, end: null });

        expect(result.start).toBeUndefined();
        expect(result.end).toBeUndefined();
    });
});
