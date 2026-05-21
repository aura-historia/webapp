import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useResolvedAuth } from "@/hooks/auth/useResolvedAuth.ts";

const mockUseRouteContext = vi.hoisted(() => vi.fn());
const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
const mockHubListen = vi.hoisted(() => vi.fn(() => vi.fn()));

vi.mock("@/routes/__root.tsx", () => ({
    Route: {
        useRouteContext: mockUseRouteContext,
    },
}));

vi.mock("aws-amplify/auth", () => ({
    getCurrentUser: mockGetCurrentUser,
    signOut: mockSignOut,
}));

vi.mock("aws-amplify/utils", () => ({
    Hub: {
        listen: mockHubListen,
    },
}));

const clientUser = { userId: "client-user-id", username: "client-user" };
const serverUser = { userId: "server-user-id", username: "server-user" };

describe("useResolvedAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetCurrentUser.mockRejectedValue(new Error("Not authenticated"));
    });

    it("treats server-authenticated sessions as authenticated", () => {
        mockGetCurrentUser.mockImplementation(() => new Promise(() => {}));
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: serverUser },
        });

        const { result } = renderHook(() => useResolvedAuth());

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isResolved).toBe(true);
        expect(result.current.serverUser).toBe(serverUser);
        expect(result.current.signOut).toEqual(expect.any(Function));
    });

    it("does not keep stale server auth after the client session resolves as signed out", async () => {
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: serverUser },
        });

        const { result } = renderHook(() => useResolvedAuth());

        expect(result.current.isAuthenticated).toBe(true);

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(false);
        });

        expect(result.current.isResolved).toBe(true);
    });

    it("uses the client Amplify session when server auth is anonymous", async () => {
        mockGetCurrentUser.mockResolvedValue(clientUser);
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: false, user: null },
        });

        const { result } = renderHook(() => useResolvedAuth());

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        expect(result.current.isResolved).toBe(true);
        expect(result.current.user).toEqual(clientUser);
    });

    it("stays unresolved while client auth is loading and server auth is anonymous", () => {
        mockGetCurrentUser.mockImplementation(() => new Promise(() => {}));
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: false, user: null },
        });

        const { result } = renderHook(() => useResolvedAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isResolved).toBe(false);
    });

    it("clears the local auth state immediately when signing out", async () => {
        mockGetCurrentUser.mockResolvedValue(clientUser);
        mockSignOut.mockResolvedValue(undefined);
        mockUseRouteContext.mockReturnValue({
            serverAuth: { authenticated: true, user: serverUser },
        });

        const { result } = renderHook(() => useResolvedAuth());

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        await act(async () => {
            await result.current.signOut();
        });

        expect(mockSignOut).toHaveBeenCalled();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
    });
});
