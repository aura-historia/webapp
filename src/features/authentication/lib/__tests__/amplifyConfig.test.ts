import { describe, expect, it, vi } from "vitest";

const mockConfigure = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify", () => ({
    Amplify: {
        configure: mockConfigure,
    },
}));

vi.mock("aws-amplify/auth/enable-oauth-listener", () => ({}));

import { amplifyConfig } from "@/amplify-config.ts";

describe("Amplify configuration", () => {
    it("keeps native login and configures Cognito authorization-code OAuth from env", () => {
        expect(amplifyConfig.Auth.Cognito.userPoolId).toBe("test-pool-id");
        expect(amplifyConfig.Auth.Cognito.userPoolClientId).toBe("test-client-id");
        expect(amplifyConfig.Auth.Cognito.loginWith.email).toBe(true);
        expect(amplifyConfig.Auth.Cognito.loginWith.oauth).toEqual({
            domain: "auth.stage.aura-historia.com",
            scopes: ["openid", "email", "profile"],
            redirectSignIn: ["http://localhost:3000"],
            redirectSignOut: ["http://localhost:3000"],
            responseType: "code",
        });
        expect(mockConfigure).toHaveBeenCalledWith(amplifyConfig, { ssr: true });
    });
});
