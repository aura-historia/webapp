import { describe, expect, it, vi } from "vitest";
import { getAuthErrorMessage } from "../getAuthErrorMessage.ts";
import type { TFunction } from "i18next";

// Minimal t-mock: returns the key so we can assert on the key
const t = vi.fn((key: string) => key) as unknown as TFunction;

function makeError(name: string, message = "some error"): Error {
    const e = new Error(message);
    e.name = name;
    return e;
}

describe("getAuthErrorMessage", () => {
    it("returns UsernameExistsException key for UsernameExistsException", () => {
        expect(getAuthErrorMessage(makeError("UsernameExistsException"), t)).toBe(
            "auth.errors.UsernameExistsException",
        );
    });

    it("returns UsernameExistsException key for AliasExistsException", () => {
        expect(getAuthErrorMessage(makeError("AliasExistsException"), t)).toBe(
            "auth.errors.UsernameExistsException",
        );
    });

    it("returns NotAuthorizedException key", () => {
        expect(getAuthErrorMessage(makeError("NotAuthorizedException"), t)).toBe(
            "auth.errors.NotAuthorizedException",
        );
    });

    it("returns UserNotFoundException key", () => {
        expect(getAuthErrorMessage(makeError("UserNotFoundException"), t)).toBe(
            "auth.errors.UserNotFoundException",
        );
    });

    it("returns CodeMismatchException key", () => {
        expect(getAuthErrorMessage(makeError("CodeMismatchException"), t)).toBe(
            "auth.errors.CodeMismatchException",
        );
    });

    it("returns LimitExceededException key", () => {
        expect(getAuthErrorMessage(makeError("LimitExceededException"), t)).toBe(
            "auth.errors.LimitExceededException",
        );
    });

    it("returns TooManyRequestsException key", () => {
        expect(getAuthErrorMessage(makeError("TooManyRequestsException"), t)).toBe(
            "auth.errors.TooManyRequestsException",
        );
    });

    it("returns InvalidPasswordException key", () => {
        expect(getAuthErrorMessage(makeError("InvalidPasswordException"), t)).toBe(
            "auth.errors.InvalidPasswordException",
        );
    });

    it("returns ExpiredCodeException key", () => {
        expect(getAuthErrorMessage(makeError("ExpiredCodeException"), t)).toBe(
            "auth.errors.ExpiredCodeException",
        );
    });

    it("returns UserNotConfirmedException key", () => {
        expect(getAuthErrorMessage(makeError("UserNotConfirmedException"), t)).toBe(
            "auth.errors.UserNotConfirmedException",
        );
    });

    it("returns InvalidParameterException key", () => {
        expect(getAuthErrorMessage(makeError("InvalidParameterException"), t)).toBe(
            "auth.errors.InvalidParameterException",
        );
    });

    it("returns EmptySignInUsername key", () => {
        expect(getAuthErrorMessage(makeError("EmptySignInUsername"), t)).toBe(
            "auth.errors.EmptySignInUsername",
        );
    });

    it("returns EmptySignInPassword key", () => {
        expect(getAuthErrorMessage(makeError("EmptySignInPassword"), t)).toBe(
            "auth.errors.EmptySignInPassword",
        );
    });

    it("returns error.message for unknown Error name", () => {
        const e = makeError("UnknownErrorName", "Something went wrong");
        const result = getAuthErrorMessage(e, t);
        expect(result).toBe("Something went wrong");
    });

    it("returns apiErrors.unknown fallback for non-Error value", () => {
        expect(getAuthErrorMessage("a string", t)).toBe("apiErrors.unknown");
        expect(getAuthErrorMessage(null, t)).toBe("apiErrors.unknown");
        expect(getAuthErrorMessage(42, t)).toBe("apiErrors.unknown");
    });

    it("returns apiErrors.unknown fallback when error message is empty", () => {
        const e = makeError("UnknownError", "");
        const result = getAuthErrorMessage(e, t);
        expect(result).toBe("apiErrors.unknown");
    });
});
