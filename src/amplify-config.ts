import { Amplify } from "aws-amplify";
// Completes Cognito redirect sign-ins when the callback page loads. The listener
// is guarded by Amplify's isBrowser() check, so importing it here is SSR-safe.
import "aws-amplify/auth/enable-oauth-listener";
import { env } from "@/env";

export const amplifyConfig = {
    Auth: {
        Cognito: {
            userPoolId: env.VITE_USER_POOL_ID,
            userPoolClientId: env.VITE_USER_POOL_CLIENT_ID,
            loginWith: {
                email: true,
                oauth: {
                    domain: env.VITE_COGNITO_DOMAIN,
                    scopes: ["openid", "email", "profile"],
                    redirectSignIn: [env.VITE_COGNITO_REDIRECT_SIGN_IN],
                    redirectSignOut: [env.VITE_COGNITO_REDIRECT_SIGN_OUT],
                    responseType: "code" as const,
                },
            },
            signUpVerificationMethod: "code" as const,
        },
    },
};

Amplify.configure(amplifyConfig, {
    ssr: true,
});
