import { describe, expect, it } from "vitest";
import { parseItemState } from "../ItemState";

describe("parseItemState", () => {
    it("should return the same state for a valid state 'LISTED'", () => {
        expect(parseItemState("LISTED")).toBe("LISTED");
    });

    it("should return the same state for a valid state 'AVAILABLE'", () => {
        expect(parseItemState("AVAILABLE")).toBe("AVAILABLE");
    });

    it("should return the same state for a valid state 'RESERVED'", () => {
        expect(parseItemState("RESERVED")).toBe("RESERVED");
    });

    it("should return the same state for a valid state 'SOLD'", () => {
        expect(parseItemState("SOLD")).toBe("SOLD");
    });

    it("should return the same state for a valid state 'REMOVED'", () => {
        expect(parseItemState("REMOVED")).toBe("REMOVED");
    });

    it("should return unknown state any other state", () => {
        expect(parseItemState("INVALID")).toBe("UNKNOWN");
    });

    it("should return unknown state for an empty string as state", () => {
        expect(parseItemState("")).toBe("UNKNOWN");
    });

    it("should return unknown state for a null value as state", () => {
        expect(parseItemState(null as unknown as string)).toBe("UNKNOWN");
    });

    it("should return unknown state for an undefined value as state", () => {
        expect(parseItemState(undefined as unknown as string)).toBe("UNKNOWN");
    });
});
