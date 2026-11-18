import { useMutation } from "@tanstack/react-query";
import { submitContentNotice } from "@/client";
import type { ContentNoticeRequest } from "@/features/content-notice/lib/contentNoticeForm.ts";

export type ContentNoticeFailure = "invalid" | "notFound" | "rateLimited" | "unavailable";

/**
 * A failed submission. It carries only the status, the stable error code and the rejected field's
 * JSON pointer, never anything the person typed (the backend never echoes values either).
 */
export class ContentNoticeSubmitError extends Error {
    constructor(
        readonly failure: ContentNoticeFailure,
        readonly status: number,
        readonly field?: string,
    ) {
        super(`Content notice failed (${status})`);
        this.name = "ContentNoticeSubmitError";
    }
}

function problemField(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null || !("source" in error)) return undefined;
    const source = error.source;
    if (typeof source !== "object" || source === null || !("field" in source)) return undefined;
    return typeof source.field === "string" ? source.field : undefined;
}

export function failureForStatus(status: number): ContentNoticeFailure {
    if (status === 400) return "invalid";
    if (status === 404) return "notFound";
    if (status === 429) return "rateLimited";
    return "unavailable";
}

/** Sends a notice. A `202` has no body; retrying an identical notice within 24 h is safe. */
export function useSubmitContentNotice() {
    return useMutation<void, ContentNoticeSubmitError, ContentNoticeRequest>({
        mutationFn: async ({ body }) => {
            let response: Awaited<ReturnType<typeof submitContentNotice>>;
            try {
                response = await submitContentNotice({ body });
            } catch {
                throw new ContentNoticeSubmitError("unavailable", 0);
            }
            if (response.error !== undefined || !response.response?.ok) {
                const status = response.response?.status ?? 0;
                throw new ContentNoticeSubmitError(
                    failureForStatus(status),
                    status,
                    problemField(response.error),
                );
            }
        },
    });
}
