import type { TFunction } from "i18next";

export function getAuthErrorMessage(err: unknown, t: TFunction): string {
    if (err instanceof Error) {
        // AWS Amplify Auth errors usually expose the error code in the name property
        const name = err.name;

        switch (name) {
            case "UsernameExistsException":
            case "AliasExistsException":
                return t("auth.errors.UsernameExistsException");
            case "NotAuthorizedException":
                return t("auth.errors.NotAuthorizedException");
            case "UserNotFoundException":
                return t("auth.errors.UserNotFoundException");
            case "CodeMismatchException":
                return t("auth.errors.CodeMismatchException");
            case "LimitExceededException":
                return t("auth.errors.LimitExceededException");
            case "TooManyRequestsException":
                return t("auth.errors.TooManyRequestsException");
            case "InvalidPasswordException":
                return t("auth.errors.InvalidPasswordException");
            case "ExpiredCodeException":
                return t("auth.errors.ExpiredCodeException");
            case "UserNotConfirmedException":
                return t("auth.errors.UserNotConfirmedException");
            case "InvalidParameterException":
                return t("auth.errors.InvalidParameterException");
            case "EmptySignInUsername":
                return t("auth.errors.EmptySignInUsername");
            case "EmptySignInPassword":
                return t("auth.errors.EmptySignInPassword");
            default:
                return err.message || t("apiErrors.unknown");
        }
    }

    return t("apiErrors.unknown");
}
