import { Amplify } from "aws-amplify";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_USER_POOL_ID,
            userPoolClientId: import.meta.env.VITE_CLIENT_ID,
            loginWith: {
                email: true,
            },
            signUpVerificationMethod: "code",
            userAttributes: {
                email: {
                    required: true,
                },
            },
            passwordFormat: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireNumbers: true,
                requireSpecialCharacters: true,
            },
        },
    },
});
