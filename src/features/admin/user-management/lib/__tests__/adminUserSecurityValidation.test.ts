import { describe, expect, it } from "vitest";
import {
    ADMIN_SUSPENSION_REASON_MAX_BYTES,
    normalizeAdminSuspensionReason,
    utf8ByteLength,
} from "../adminUserSecurityValidation.ts";

describe("admin suspension reason validation", () => {
    it("rejects blank reasons and trims the value sent to the backend", () => {
        expect(normalizeAdminSuspensionReason("  \n\t ")).toBeUndefined();
        expect(normalizeAdminSuspensionReason("  Policy violation  ")).toBe("Policy violation");
    });

    it("measures UTF-8 bytes for Unicode at the documented boundary", () => {
        const exactLimit = "é".repeat(ADMIN_SUSPENSION_REASON_MAX_BYTES / 2);
        const overLimit = `${exactLimit}é`;

        expect(utf8ByteLength(exactLimit)).toBe(1_000);
        expect(normalizeAdminSuspensionReason(exactLimit)).toBe(exactLimit);
        expect(utf8ByteLength(overLimit)).toBe(1_002);
        expect(normalizeAdminSuspensionReason(overLimit)).toBeUndefined();
        expect(utf8ByteLength("🔒")).toBe(4);
    });
});
