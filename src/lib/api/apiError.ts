import type { ApiError } from "@/client";

export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
    );
}

export function isApiNotFoundError(error: unknown): error is ApiError {
    return isApiError(error) && error.status === 404;
}
