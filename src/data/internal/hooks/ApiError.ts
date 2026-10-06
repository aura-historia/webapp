import type { ApiError, ApiErrorSource } from "@/client";

export type ApiErrorData = {
    readonly status: number;
    readonly title: string;
    readonly error: string;
    readonly detail?: string;
    readonly source?: ApiErrorSourceData;
};

export type ApiErrorSourceData = {
    readonly field: string;
    readonly type: "QUERY" | "PATH" | "HEADER" | "BODY";
};

function mapApiErrorSource(apiSource: ApiErrorSource | undefined): ApiErrorSourceData | undefined {
    if (!apiSource || typeof apiSource.field !== "string") return undefined;
    if (!["QUERY", "PATH", "HEADER", "BODY"].includes(apiSource.type)) return undefined;

    return {
        field: apiSource.field,
        type: apiSource.type,
    };
}

/** Maps API problem details while providing a stable fallback for body-less failures. */
export function mapToInternalApiError(
    apiError: ApiError | null | undefined,
    statusFallback = 500,
): ApiErrorData {
    if (!apiError || typeof apiError !== "object") {
        return {
            status: statusFallback,
            title: "Unknown error",
            error: "UNKNOWN_ERROR",
        };
    }

    return {
        status: typeof apiError.status === "number" ? apiError.status : statusFallback,
        title: typeof apiError.title === "string" ? apiError.title : "Unknown error",
        error: typeof apiError.error === "string" ? apiError.error : "UNKNOWN_ERROR",
        detail: typeof apiError.detail === "string" ? apiError.detail : undefined,
        source: mapApiErrorSource(apiError.source),
    };
}
