import { describe, expect, it } from "vitest";
import { cn } from "../utils.ts";

describe("utils", () => {
    describe("cn", () => {
        it("should merge class names correctly", () => {
            expect(cn("foo", "bar")).toBe("foo bar");
        });

        it("should handle conditional classes", () => {
            expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
        });

        it("should merge tailwind classes correctly", () => {
            expect(cn("px-2 py-1", "px-3")).toBe("py-1 px-3");
        });

        it("should handle empty input", () => {
            expect(cn()).toBe("");
        });

        it("should handle undefined and null values", () => {
            expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
        });
    });
});
