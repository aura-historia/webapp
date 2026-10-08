import { Amplify } from "aws-amplify";
import { env } from "@/env";

// aws-amplify 6.20.0 guards this side effect with its isBrowser() check, so it
// is safe to import from the shared SSR/client configuration module.
import "aws-amplify/auth/enable-oauth-listener";

const hasCognitoOAuthConfig = Boolean(
    env.VITE_COGNITO_DOMAIN &&
        env.VITE_COGNITO_REDIRECT_SIGN_IN &&
        env.VITE_COGNITO_REDIRECT_SIGN_OUT,
);

if (
    [
        env.VITE_COGNITO_DOMAIN,
        env.VITE_COGNITO_REDIRECT_SIGN_IN,
        env.VITE_COGNITO_REDIRECT_SIGN_OUT,
    ].some(Boolean) &&
    !hasCognitoOAuthConfig
) {
    throw new Error(
        "Set VITE_COGNITO_DOMAIN, VITE_COGNITO_REDIRECT_SIGN_IN, and VITE_COGNITO_REDIRECT_SIGN_OUT together.",
    );
}

const oauth = hasCognitoOAuthConfig
    ? {
          domain: env.VITE_COGNITO_DOMAIN as string,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [env.VITE_COGNITO_REDIRECT_SIGN_IN as string],
          redirectSignOut: [env.VITE_COGNITO_REDIRECT_SIGN_OUT as string],
          responseType: "code" as const,
      }
    : undefined;

export const amplifyConfig = {
    Auth: {
        Cognito: {
            userPoolId: env.VITE_USER_POOL_ID,
            userPoolClientId: env.VITE_USER_POOL_CLIENT_ID,
            loginWith: {
                email: true,
                ...(oauth ? { oauth } : {}),
            },
            signUpVerificationMethod: "code" as const,
        },
    },
};

Amplify.configure(amplifyConfig, {
    ssr: true,
});
