import { beforeEach, describe, expect, it, vi } from "vitest";

describe("api-config user-agent header behavior", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it("should not overwrite request user-agent with default header", async () => {
        vi.doMock("@/env.ts", () => ({
            env: {
                VITE_API_URL: "https://test.com",
            },
        }));

        vi.doMock("@aws-amplify/auth", () => ({
            fetchAuthSession: vi.fn(),
        }));

        const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));

        const apiConfigModule = await import("@/api-config.ts");
        expect(apiConfigModule).toBeDefined();
        const { client } = await import("@/client/client.gen");

        await client.request({
            fetch: fetchMock,
            headers: {
                "user-agent": "browser-user-agent",
            },
            method: "GET",
            url: "/test",
        });

        const request = fetchMock.mock.calls[0][0] as Request;
        expect(request.headers.get("user-agent")).toBe("browser-user-agent");
    });
});
