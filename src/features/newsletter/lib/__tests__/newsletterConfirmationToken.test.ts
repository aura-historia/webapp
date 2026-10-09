import { describe, expect, it } from "vitest";
import {
    NEWSLETTER_CONFIRMATION_TOKEN_MAX_LENGTH,
    parseNewsletterConfirmationFragment,
} from "../newsletterConfirmationToken.ts";

const TOKEN = "AbC123_-xyz0123456789AbC123_-xyz0123456789";

describe("parseNewsletterConfirmationFragment", () => {
    it("reads one base64url token from the fragment", () => {
        expect(parseNewsletterConfirmationFragment(`#token=${TOKEN}`)).toEqual({
            kind: "token",
            token: TOKEN,
        });
    });

    it("accepts a token at the backend length limit", () => {
        const token = "a".repeat(NEWSLETTER_CONFIRMATION_TOKEN_MAX_LENGTH);
        expect(parseNewsletterConfirmationFragment(`#token=${token}`)).toEqual({
            kind: "token",
            token,
        });
    });

    it.each(["", "#", "#other=value"])("reports a missing token for %j", (hash) => {
        expect(parseNewsletterConfirmationFragment(hash)).toEqual({ kind: "missing" });
    });

    it.each([
        ["an empty value", "#token="],
        ["a bare key", "#token"],
        ["a duplicate token", `#token=${TOKEN}&token=${TOKEN}`],
        [
            "an oversized token",
            `#token=${"a".repeat(NEWSLETTER_CONFIRMATION_TOKEN_MAX_LENGTH + 1)}`,
        ],
        ["padding", `#token=${TOKEN}=`],
        ["percent-encoding", `#token=${TOKEN}%2B`],
        ["standard base64 characters", "#token=abc+def/ghi"],
        ["whitespace", "#token=abc%20def"],
        ["script-like content", "#token=<script>"],
    ])("rejects %s", (_, hash) => {
        expect(parseNewsletterConfirmationFragment(hash)).toEqual({ kind: "malformed" });
    });
});
