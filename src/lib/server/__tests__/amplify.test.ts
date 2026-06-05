import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken, getServerUser } from "../amplify.ts";

const mockGetServerAuthToken = vi.hoisted(() => vi.fn());
const mockGetServerUserSession = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-start", () => ({
    createServerFn: vi.fn().mockReturnValue({
        handler: (cb: (...args: unknown[]) => unknown) => cb,
    }),
}));

vi.mock("../amplify.server.ts", () => ({
    getServerAuthToken: mockGetServerAuthToken,
    getServerUserSession: mockGetServerUserSession,
}));

describe("Amplify server function wrappers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("delegates current user lookup to the server-only helper", async () => {
        mockGetServerUserSession.mockResolvedValue({
            user: { username: "test-user" },
            authenticated: true,
        });

        await expect(getServerUser()).resolves.toEqual({
            user: { username: "test-user" },
            authenticated: true,
        });
        expect(mockGetServerUserSession).toHaveBeenCalledTimes(1);
    });

    it("delegates auth token lookup to the server-only helper", async () => {
        mockGetServerAuthToken.mockResolvedValue("access-token");

        await expect(getAuthToken()).resolves.toBe("access-token");
        expect(mockGetServerAuthToken).toHaveBeenCalledTimes(1);
    });
});
