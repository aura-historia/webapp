import { translations } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { I18n } from "aws-amplify/utils";
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

I18n.putVocabularies(translations);
