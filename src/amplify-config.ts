import { Amplify } from "aws-amplify";
import { env } from "@/env";

export const amplifyConfig = {
    Auth: {
        Cognito: {
            userPoolId: env.VITE_USER_POOL_ID,
            userPoolClientId: env.VITE_CLIENT_ID,
            loginWith: {
                email: true,
            },
            signUpVerificationMethod: "code" as const,
        },
    },
};

Amplify.configure(amplifyConfig, {
    ssr: true,
});
