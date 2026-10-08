export type FederatedAuthProvider = {
    id: string;
    signInProvider: "Google" | { custom: string };
    labelKey: string;
};

/** Presentation and Cognito-provider metadata only; never put OAuth secrets here. */
export const FEDERATED_AUTH_PROVIDERS = [
    {
        id: "google",
        signInProvider: "Google",
        labelKey: "auth.federated.google.continue",
    },
] as const satisfies readonly FederatedAuthProvider[];
