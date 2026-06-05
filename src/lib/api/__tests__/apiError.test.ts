import { describe, expect, it } from "vitest";
import { isApiError, isApiNotFoundError } from "@/lib/api/apiError.ts";

describe("apiError", () => {
    describe("isApiError", () => {
        it("returns true for objects with a numeric status", () => {
            expect(
                isApiError({
                    status: 500,
                    title: "Internal Server Error",
                    error: "INTERNAL_SERVER_ERROR",
                }),
            ).toBe(true);
        });

        it("returns false for non-object values", () => {
            expect(isApiError(null)).toBe(false);
            expect(isApiError(undefined)).toBe(false);
            expect(isApiError("Not Found")).toBe(false);
        });

        it("returns false when status is missing or not numeric", () => {
            expect(isApiError({ title: "Not Found", error: "NOT_FOUND" })).toBe(false);
            expect(
                isApiError({
                    status: "404",
                    title: "Not Found",
                    error: "NOT_FOUND",
                }),
            ).toBe(false);
        });
    });

    describe("isApiNotFoundError", () => {
        it("returns true for API errors with status 404", () => {
            expect(
                isApiNotFoundError({
                    status: 404,
                    title: "Not Found",
                    error: "PRODUCT_NOT_FOUND",
                    detail: "Product not found",
                }),
            ).toBe(true);
        });

        it("returns false for API errors with any other status", () => {
            expect(
                isApiNotFoundError({
                    status: 500,
                    title: "Internal Server Error",
                    error: "INTERNAL_SERVER_ERROR",
                }),
            ).toBe(false);
        });

        it("returns false for values that are not API errors", () => {
            expect(isApiNotFoundError({ status: "404" })).toBe(false);
            expect(isApiNotFoundError(new Error("Not Found"))).toBe(false);
        });
    });
});
