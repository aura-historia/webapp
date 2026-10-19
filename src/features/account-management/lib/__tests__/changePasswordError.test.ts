import { describe, expect, it } from "vitest";
import { getChangePasswordError } from "../changePasswordError.ts";

function cognitoError(name: string, message: string): Error {
    const error = new Error(message);
    error.name = name;
    return error;
}

describe("getChangePasswordError", () => {
    it("maps a wrong current password to the current password field", () => {
        expect(
            getChangePasswordError(
                cognitoError("NotAuthorizedException", "Incorrect username or password."),
            ),
        ).toEqual({
            field: "currentPassword",
            messageKey: "account.changePassword.incorrectCurrentPassword",
        });
    });

    it.each([
        ["LimitExceededException", "Attempt limit exceeded, please try after some time."],
        ["NotAuthorizedException", "Password attempts exceeded"],
        ["TooManyRequestsException", "Too many requests"],
    ])("maps %s (%s) to the attempt limit message", (name, message) => {
        expect(getChangePasswordError(cognitoError(name, message))).toEqual({
            messageKey: "account.changePassword.attemptLimitExceeded",
        });
    });

    it("matches Cognito's message when the error name is missing", () => {
        expect(
            getChangePasswordError(new Error("Attempt limit exceeded, please try after some time."))
                .messageKey,
        ).toBe("account.changePassword.attemptLimitExceeded");
        expect(getChangePasswordError(new Error("Incorrect username or password.")).field).toBe(
            "currentPassword",
        );
    });

    it("falls back to the generic message, never Cognito's text", () => {
        expect(getChangePasswordError(cognitoError("Unknown", "Something broke"))).toEqual({
            messageKey: "account.changePassword.errorMessage",
        });
        expect(getChangePasswordError("not an error").messageKey).toBe(
            "account.changePassword.errorMessage",
        );
    });
});
