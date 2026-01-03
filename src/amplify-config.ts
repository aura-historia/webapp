import { translations } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { I18n } from "aws-amplify/utils";
import { env } from "@/env";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: env.VITE_USER_POOL_ID,
            userPoolClientId: env.VITE_CLIENT_ID,
            loginWith: {
                email: true,
            },
            signUpVerificationMethod: "code",
        },
    },
});

I18n.putVocabularies(translations);
