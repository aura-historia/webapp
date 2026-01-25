import { describe, expect, it } from "vitest";
import { parseProductState } from "../product/ProductState.ts";

describe("parseProductState", () => {
    it("should return the same state for a valid state 'LISTED'", () => {
        expect(parseProductState("LISTED")).toBe("LISTED");
    });

    it("should return the same state for a valid state 'AVAILABLE'", () => {
        expect(parseProductState("AVAILABLE")).toBe("AVAILABLE");
    });

    it("should return the same state for a valid state 'RESERVED'", () => {
        expect(parseProductState("RESERVED")).toBe("RESERVED");
    });

    it("should return the same state for a valid state 'SOLD'", () => {
        expect(parseProductState("SOLD")).toBe("SOLD");
    });

    it("should return the same state for a valid state 'REMOVED'", () => {
        expect(parseProductState("REMOVED")).toBe("REMOVED");
    });

    it("should return unknown state any other state", () => {
        expect(parseProductState("INVALID")).toBe("UNKNOWN");
    });

    it("should return unknown state for an empty string as state", () => {
        expect(parseProductState("")).toBe("UNKNOWN");
    });

    it("should return unknown state for a null value as state", () => {
        expect(parseProductState(null as unknown as string)).toBe("UNKNOWN");
    });

    it("should return unknown state for an undefined value as state", () => {
        expect(parseProductState(undefined as unknown as string)).toBe("UNKNOWN");
    });
});
