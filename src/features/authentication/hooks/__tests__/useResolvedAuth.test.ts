import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
const mockHubSubscription = vi.hoisted(() => ({
    callback: null as null | ((input: { payload: { event: string } }) => void),
}));
const mockHubListen = vi.hoisted(() =>
    vi.fn((_channel: string, callback: (input: { payload: { event: string } }) => void) => {
        mockHubSubscription.callback = callback;
        return vi.fn();
    }),
);

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

describe("useResolvedAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHubSubscription.callback = null;
        mockGetCurrentUser.mockRejectedValue(new Error("Not authenticated"));
    });

    it("keeps auth unresolved until the client session is checked", () => {
        mockGetCurrentUser.mockImplementation(() => new Promise(() => {}));

        const { result } = renderHook(() => useResolvedAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isResolved).toBe(false);
        expect(result.current.signOut).toEqual(expect.any(Function));
    });

    it("resolves as signed out when the client session check fails", async () => {
        const { result } = renderHook(() => useResolvedAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isResolved).toBe(false);

        await waitFor(() => {
            expect(result.current.isResolved).toBe(true);
        });

        expect(result.current.isAuthenticated).toBe(false);
    });

    it("uses the client Amplify session when available", async () => {
        mockGetCurrentUser.mockResolvedValue(clientUser);

        const { result } = renderHook(() => useResolvedAuth());

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        expect(result.current.isResolved).toBe(true);
        expect(result.current.user).toEqual(clientUser);
    });

    it("refreshes the current user when a federated redirect completes", async () => {
        mockGetCurrentUser.mockResolvedValue(clientUser);

        const { result } = renderHook(() => useResolvedAuth());
        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        const callsBeforeRedirectEvent = mockGetCurrentUser.mock.calls.length;
        act(() => {
            mockHubSubscription.callback?.({ payload: { event: "signInWithRedirect" } });
        });

        await waitFor(() => {
            expect(mockGetCurrentUser).toHaveBeenCalledTimes(callsBeforeRedirectEvent + 1);
        });
        expect(result.current.isAuthenticated).toBe(true);
    });

    it("stays unresolved while client auth is loading", () => {
        mockGetCurrentUser.mockImplementation(() => new Promise(() => {}));

        const { result } = renderHook(() => useResolvedAuth());

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isResolved).toBe(false);
    });

    it("clears the local auth state immediately when signing out", async () => {
        mockGetCurrentUser.mockResolvedValue(clientUser);
        mockSignOut.mockResolvedValue(undefined);

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
