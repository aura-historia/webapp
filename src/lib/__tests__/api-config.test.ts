import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the client before importing api-config
const mockSetConfig = vi.fn();
const mockClient = {
    setConfig: mockSetConfig,
};

vi.mock("@/client/client.gen", () => ({
    client: mockClient,
}));

vi.mock("@aws-amplify/auth", () => ({
    fetchAuthSession: vi.fn(),
}));

describe("api-config", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
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
});
