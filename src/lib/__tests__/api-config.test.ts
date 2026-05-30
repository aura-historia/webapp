import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the client before importing api-config
const mockSetConfig = vi.fn();
const mockErrorInterceptorUse = vi.fn();
const mockClient = {
    setConfig: mockSetConfig,
    interceptors: {
        error: {
            use: mockErrorInterceptorUse,
        },
    },
};
const mockSignOut = vi.hoisted(() => vi.fn());

vi.mock("@/client/client.gen", () => ({
    client: mockClient,
}));

vi.mock("aws-amplify/auth", () => ({
    fetchAuthSession: vi.fn(),
    signOut: mockSignOut,
}));

vi.mock("@/lib/server/amplify.ts", () => ({
    getAuthToken: vi.fn(),
}));

describe("api-config", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        mockSignOut.mockResolvedValue(undefined);
    });

    it("should use VITE_API_URL when environment variable is set", async () => {
        const testApiUrl = "https://test.api.url.com";

        // Mock env with VITE_API_URL set
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: testApiUrl,
            },
        }));

        // Import api-config (this will execute the setConfig call)
        await import("@/api-config.ts");

        expect(mockSetConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                baseUrl: testApiUrl,
            }),
        );
    });

    it("should use default baseUrl when VITE_API_URL is not set", async () => {
        // Mock env with VITE_API_URL as undefined
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: undefined,
            },
        }));

        // Import api-config
        await import("@/api-config.ts");

        expect(mockSetConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                baseUrl: "https://api.dev.aura-historia.com",
            }),
        );
    });

    it("should configure auth function", async () => {
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: "https://test.com",
            },
        }));

        await import("@/api-config.ts");

        const configCall = mockSetConfig.mock.calls[mockSetConfig.mock.calls.length - 1][0];
        expect(configCall.auth).toBeDefined();
        expect(typeof configCall.auth).toBe("function");
    });

    it("signs out on explicit current-user-not-found API errors", async () => {
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: "https://test.com",
            },
        }));

        await import("@/api-config.ts");

        const errorInterceptor = mockErrorInterceptorUse.mock.calls.at(-1)?.[0];
        const userNotFoundError = {
            status: 404,
            title: "Not Found",
            error: "USER_NOT_FOUND",
            detail: "User not found",
        };

        await expect(errorInterceptor(userNotFoundError)).resolves.toBe(userNotFoundError);

        expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it("does not sign out on unrelated 404 API errors", async () => {
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: "https://test.com",
            },
        }));

        await import("@/api-config.ts");

        const errorInterceptor = mockErrorInterceptorUse.mock.calls.at(-1)?.[0];
        const productNotFoundError = {
            status: 404,
            title: "Not Found",
            error: "PRODUCT_NOT_FOUND",
            detail: "Product not found",
        };

        await expect(errorInterceptor(productNotFoundError)).resolves.toBe(productNotFoundError);

        expect(mockSignOut).not.toHaveBeenCalled();
    });

    it("keeps the original API error when forced sign-out fails", async () => {
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: "https://test.com",
            },
        }));
        mockSignOut.mockRejectedValue(new Error("Auth UserPool not configured"));
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        await import("@/api-config.ts");

        const errorInterceptor = mockErrorInterceptorUse.mock.calls.at(-1)?.[0];
        const userNotFoundError = {
            status: 404,
            title: "Not Found",
            error: "USER_NOT_FOUND",
            detail: "User not found",
        };

        await expect(errorInterceptor(userNotFoundError)).resolves.toBe(userNotFoundError);

        expect(mockSignOut).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "[Auth] Failed to sign out missing user session.",
            expect.any(Error),
        );

        consoleErrorSpy.mockRestore();
    });
});
