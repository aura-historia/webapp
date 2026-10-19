export type ChangePasswordErrorResult = {
    /** The form field the message belongs to; otherwise it is shown as a toast. */
    readonly field?: "currentPassword";
    readonly messageKey: string;
};

/**
 * Maps a Cognito error from `updatePassword` to a translation key. Cognito's own messages are
 * English only, so none of them is shown as is. Errors are matched by name and, as a fallback,
 * by Cognito's message.
 */
export function getChangePasswordError(error: unknown): ChangePasswordErrorResult {
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    // Repeated failures come back as NotAuthorizedException "Password attempts exceeded"
    // or as LimitExceededException "Attempt limit exceeded, please try after some time."
    if (
        name === "LimitExceededException" ||
        name === "TooManyRequestsException" ||
        message.includes("attempts exceeded") ||
        message.includes("attempt limit exceeded")
    ) {
        return { messageKey: "account.changePassword.attemptLimitExceeded" };
    }

    if (name === "NotAuthorizedException" || message.includes("incorrect username or password")) {
        return {
            field: "currentPassword",
            messageKey: "account.changePassword.incorrectCurrentPassword",
        };
    }

    if (name === "InvalidPasswordException") {
        return { messageKey: "auth.errors.InvalidPasswordException" };
    }

    return { messageKey: "account.changePassword.errorMessage" };
}
