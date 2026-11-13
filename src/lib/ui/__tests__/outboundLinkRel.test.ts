import { describe, expect, it } from "vitest";
import { outboundLinkRel } from "../outboundLinkRel.ts";

describe("outboundLinkRel", () => {
    it("marks affiliate links as sponsored", () => {
        expect(outboundLinkRel(true)).toBe("sponsored nofollow noopener noreferrer");
    });

    it("keeps other provider links unsponsored", () => {
        expect(outboundLinkRel(false)).toBe("nofollow noopener noreferrer");
    });
});
