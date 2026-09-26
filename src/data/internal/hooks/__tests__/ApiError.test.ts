import type { ApiError } from "@/client";
import { describe, expect, it } from "vitest";
import { mapToInternalApiError } from "../ApiError.ts";

describe("mapToInternalApiError", () => {
    it("maps the current uppercase source type contract", () => {
        const apiError: ApiError = {
            status: 400,
            title: "Bad Request",
            error: "BAD_QUERY",
            source: { field: "currency", type: "QUERY" },
        };

        expect(mapToInternalApiError(apiError)).toEqual({
            status: 400,
            title: "Bad Request",
            error: "BAD_QUERY",
            detail: undefined,
            source: { field: "currency", type: "QUERY" },
        });
    });

    it("provides a safe fallback when an error response has no body", () => {
        expect(mapToInternalApiError(undefined, 503)).toEqual({
            status: 503,
            title: "Unknown error",
            error: "UNKNOWN_ERROR",
        });
    });

    it("fills absent problem fields without exposing an untrusted body", () => {
        expect(mapToInternalApiError({} as ApiError, 502)).toEqual({
            status: 502,
            title: "Unknown error",
            error: "UNKNOWN_ERROR",
            detail: undefined,
            source: undefined,
        });
    });
});
