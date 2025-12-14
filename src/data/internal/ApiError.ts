import type { ApiError, ApiErrorSource } from "@/client";

export type ApiErrorData = {
    readonly status: number;
    readonly title: string;
    readonly error: string;
    readonly detail?: string;
    readonly source?: ApiErrorSourceData;
};

type ApiErrorSourceData = {
    readonly field: string;
    readonly sourceType: "query" | "path" | "header" | "body";
};

function mapApiErrorSource(apiSource: ApiErrorSource): ApiErrorSourceData {
    return {
        field: apiSource.field,
        sourceType: apiSource.sourceType,
    };
}

export function mapToInternalApiError(apiError: ApiError): ApiErrorData {
    return {
        status: apiError.status,
        title: apiError.title,
        error: apiError.error,
        detail: apiError.detail,
        source: apiError.source ? mapApiErrorSource(apiError.source) : undefined,
    };
}
