export const ADMIN_SUSPENSION_REASON_MAX_BYTES = 1_000;

export function utf8ByteLength(value: string): number {
    return new TextEncoder().encode(value).byteLength;
}

export function normalizeAdminSuspensionReason(reason: string): string | undefined {
    const normalized = reason.trim();
    if (!normalized || utf8ByteLength(normalized) > ADMIN_SUSPENSION_REASON_MAX_BYTES) {
        return undefined;
    }
    return normalized;
}
