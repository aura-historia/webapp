import { describe, expect, it } from "vitest";
import {
    FEDERATED_AUTH_PROVIDERS,
    type FederatedAuthProvider,
} from "@/features/authentication/config/federatedAuthProviders.ts";

describe("FEDERATED_AUTH_PROVIDERS", () => {
    it("maps Google to the Amplify built-in Google provider", () => {
        const google = FEDERATED_AUTH_PROVIDERS.find((provider) => provider.id === "google");

        expect(google?.signInProvider).toBe("Google");
        expect(google?.labelKey).toBe("auth.federated.google.continue");
    });

    it("maps Facebook to the Amplify built-in Facebook provider", () => {
        const facebook = FEDERATED_AUTH_PROVIDERS.find((provider) => provider.id === "facebook");

        expect(facebook?.signInProvider).toBe("Facebook");
        expect(facebook?.labelKey).toBe("auth.federated.facebook.continue");
    });

    it("uses unique provider ids", () => {
        const ids = FEDERATED_AUTH_PROVIDERS.map((provider) => provider.id);

        expect(new Set(ids).size).toBe(ids.length);
    });

    it("supports custom Cognito OIDC/SAML providers", () => {
        const custom: FederatedAuthProvider = {
            id: "example-oidc",
            signInProvider: { custom: "ExampleOIDC" },
            labelKey: "auth.federated.example.continue",
            icon: () => null,
        };

        expect(custom.signInProvider).toEqual({ custom: "ExampleOIDC" });
    });
});
