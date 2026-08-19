import i18n from "@/i18n/i18n";
import { I18n } from "aws-amplify/utils";

/**
 * Lookup table mapping Amplify's default translation keys to i18next keys.
 * The Amplify Authenticator uses these keys for its UI.
 *
 * Format: { "Amplify Key": "i18next.translation.key" }
 */
export const amplifyToI18nextKeyMap: Record<string, string> = {
    // Sign Up Form Fields
    Email: "amplify.email",
    Password: "amplify.password",
    "Confirm Password": "amplify.confirmPassword",

    // Auth Actions
    "Sign In": "amplify.signIn",
    "Sign Up": "amplify.signUp",
    "Create Account": "amplify.createAccount",
    "Forgot your password?": "amplify.forgotYourPassword",
    "Reset Password": "amplify.resetPassword",
    "Back to Sign In": "amplify.backToSignIn",
    "Send code": "amplify.sendCode",
    Confirm: "amplify.confirm",
    Submit: "amplify.submit",
    Verify: "amplify.verify",
    Skip: "amplify.skip",
    Code: "amplify.code",
    "New Password": "amplify.newPassword",

    // Placeholder texts
    "Enter your email": "amplify.enterYourEmail",
    "Enter your Email": "amplify.enterYourEmail",
    "Enter your password": "amplify.enterYourPassword",
    "Enter your Password": "amplify.enterYourPassword",
    "Please confirm your Password": "amplify.pleaseConfirmYourPassword",

    // Verification Messages
    "We Emailed You": "amplify.weEmailedYou",
    "We Sent A Code": "amplify.weSentACode",
    "We Texted You": "amplify.weTextedYou",
    "Your code is on the way. To log in, enter the code we emailed to": "amplify.codeOnTheWayEmail",
    "Your code is on the way. To log in, enter the code we sent you": "amplify.codeOnTheWaySent",
    "Your code is on the way. To log in, enter the code we texted to": "amplify.codeOnTheWayText",
    "It may take a minute to arrive": "amplify.itMayTakeAMinuteToArrive",
    "Confirmation Code": "amplify.confirmationCode",
    "Enter your Confirmation Code": "amplify.enterYourConfirmationCode",
    "Resend Code": "amplify.resendCode",

    // Auth Errors
    "Incorrect username or password.": "amplify.incorrectUsernameOrPassword",
    "User does not exist.": "amplify.userDoesNotExist",
    "User already exists": "amplify.userAlreadyExists",
    "Invalid verification code provided, please try again.": "amplify.invalidVerificationCode",
    "Invalid password format": "amplify.invalidPasswordFormat",
    "Password attempts exceeded": "amplify.passwordAttemptsExceeded",
    "Attempt limit exceeded, please try after some time.": "amplify.attemptLimitExceeded",
    "There is already a signed in user.": "amplify.alreadySignedInUser",

    // Password Policy Errors
    "Password did not conform with policy: Password not long enough":
        "amplify.passwordPolicyNotLongEnough",
    "Password did not conform with policy: Password must have lowercase characters":
        "amplify.passwordPolicyMustHaveLowercase",
    "Password did not conform with policy: Password must have uppercase characters":
        "amplify.passwordPolicyMustHaveUppercase",
    "Password did not conform with policy: Password must have symbol characters":
        "amplify.passwordPolicyMustHaveSymbol",
    "Password must have uppercase characters": "amplify.passwordMustHaveUppercase",
    "Password must have lowercase characters": "amplify.passwordMustHaveLowercase",
    "Password must have numeric characters": "amplify.passwordMustHaveNumeric",
    "Password must have symbol characters": "amplify.passwordMustHaveSymbol",
    "Password must have at least 8 characters": "amplify.passwordMustHaveAtLeast8Chars",
    "Your passwords must match": "amplify.yourPasswordsMustMatch",

    // Account Status
    "User is not confirmed.": "amplify.userIsNotConfirmed",
    "User is disabled.": "amplify.userIsDisabled",

    // Validation
    "Username cannot be empty": "amplify.usernameCannotBeEmpty",
    "Password cannot be empty": "amplify.passwordCannotBeEmpty",

    // Network & System
    "Network error": "amplify.networkError",
    "An account with the given email already exists.": "amplify.accountWithEmailAlreadyExists",
    "Invalid email address format.": "amplify.invalidEmailAddressFormat",

    // Code Verification
    "Code mismatch": "amplify.codeMismatch",
    "Confirmation code cannot be empty": "amplify.confirmationCodeCannotBeEmpty",
    "Invalid code provided, please request a code again.":
        "amplify.invalidCodeProvidedRequestAgain",
};

/**
 * Generates vocabulary object for Amplify I18n from i18next translations.
 * This function creates a mapping where each Amplify key points to its i18next translation.
 *
 * @returns Record of Amplify keys to their translated values
 */
export function getAmplifyVocabulary(): Record<string, string> {
    const vocabulary: Record<string, string> = {};

    for (const [amplifyKey, i18nextKey] of Object.entries(amplifyToI18nextKeyMap)) {
        const translation = i18n.t(i18nextKey);
        // Only include if translation exists and is different from the key (i.e., was actually translated)
        if (translation && translation !== i18nextKey) {
            vocabulary[amplifyKey] = translation;
        }
    }

    return vocabulary;
}

/**
 * Updates Amplify I18n with current i18next translations.
 * Call this function when the language changes to sync Amplify translations.
 */
export function syncAmplifyTranslations(): void {
    I18n.putVocabularies({
        [i18n.language]: getAmplifyVocabulary(),
    });
}
