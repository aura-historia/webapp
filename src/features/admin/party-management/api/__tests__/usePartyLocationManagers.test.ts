import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import { adminPartyDetailQueryKey } from "../useAdminParties.ts";
import {
    partyLocationManagersQueryKey,
    usePartyLocationManager,
    usePartyLocationManagers,
    useSetPartyLocationManagementGrant,
} from "../usePartyLocationManagers.ts";

const api = vi.hoisted(() => ({ setGrant: vi.fn(), list: vi.fn() }));
vi.mock("@/client", () => ({
    setPartyLocationManagementGrant: api.setGrant,
    listPartyLocationManagers: api.list,
}));

const noContent = () => ({ data: {}, response: { status: 204, ok: true } });
const failure = (status: number) => ({
    error: { status, title: "Problem", error: "PROBLEM", detail: "user@example.test" },
    response: { status, ok: false },
});

const managersPage = (searchAfter?: string) => ({
    data: {
        items: [
            {
                userId: "usr_1",
                email: "both@example.test",
                firstName: "Grace",
                access: [{ type: "EXPLICIT" }, { type: "PARTNERSHIP", partnershipIds: ["psh_1"] }],
            },
        ],
        size: 1,
        ...(searchAfter && { searchAfter }),
    },
    response: { status: 200, ok: true },
});

describe("partyLocationManagers reads", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient();
    });

    it("lists current managers privately and pages with searchAfter", async () => {
        api.list.mockResolvedValueOnce(managersPage("usr_1")).mockResolvedValueOnce({
            data: { items: [], size: 0 },
            response: { status: 200, ok: true },
        });
        const { result } = renderHook(() => usePartyLocationManagers("pty_1"), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.list).toHaveBeenCalledWith({
            path: { party_id: "pty_1" },
            query: { size: 21 },
            signal: expect.any(AbortSignal),
            cache: "no-store",
        });
        expect(result.current.data?.pages[0].items).toEqual([
            {
                userId: "usr_1",
                email: "both@example.test",
                firstName: "Grace",
                hasExplicitGrant: true,
                partnershipIds: ["psh_1"],
            },
        ]);

        await act(() => result.current.fetchNextPage());
        expect(api.list).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: { size: 21, searchAfter: "usr_1" } }),
        );
        await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    });

    it("reads one selected user's access and reports none as null", async () => {
        api.list.mockResolvedValue({
            data: { items: [], size: 0 },
            response: { status: 200, ok: true },
        });
        const { result } = renderHook(() => usePartyLocationManager("pty_1", "usr_2"), {
            wrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(api.list).toHaveBeenCalledWith(
            expect.objectContaining({ query: { size: 1, userId: "usr_2" } }),
        );
        expect(result.current.data).toBeNull();
    });

    it("does not read before a user is selected", () => {
        renderHook(() => usePartyLocationManager("pty_1", undefined), { wrapper });
        expect(api.list).not.toHaveBeenCalled();
    });

    it.each([
        [403, "readForbidden"],
        [404, "readMissing"],
        [503, "readFailed"],
    ])("maps a %s read to fixed copy without retrying", async (status, key) => {
        api.list.mockResolvedValue(failure(status));
        const { result } = renderHook(() => usePartyLocationManagers("pty_1"), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(api.list).toHaveBeenCalledTimes(1);
        expect(result.current.error).toMatchObject({
            status,
            message: testI18n.t(`adminParties.locationAccess.errors.${key}`),
        });
    });
});

describe("useSetPartyLocationManagementGrant", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    function seed() {
        const target = geographyQueryKeys.partyLocationList("admin-1", "pty_1");
        const otherParty = geographyQueryKeys.partyLocationList("admin-1", "pty_2");
        const detail = adminPartyDetailQueryKey("pty_1");
        const managers = [...partyLocationManagersQueryKey("pty_1"), "list"];
        const otherManagers = [...partyLocationManagersQueryKey("pty_2"), "list"];
        for (const key of [target, otherParty, detail, managers, otherManagers]) {
            client.setQueryData(key, {});
        }
        return { target, otherParty, detail, managers, otherManagers };
    }

    it.each([true, false])("sends an explicit { granted: %s } command", async (granted) => {
        api.setGrant.mockResolvedValue(noContent());
        const { target, otherParty, managers, otherManagers } = seed();
        const { result } = renderHook(() => useSetPartyLocationManagementGrant(), { wrapper });

        await act(() => result.current.mutateAsync({ partyId: "pty_1", userId: "usr_1", granted }));

        expect(api.setGrant).toHaveBeenCalledWith({
            path: { party_id: "pty_1", user_id: "usr_1" },
            body: { granted },
            cache: "no-store",
        });
        expect(client.getQueryState(target)?.isInvalidated).toBe(true);
        expect(client.getQueryState(otherParty)?.isInvalidated).toBe(false);
        expect(client.getQueryState(managers)?.isInvalidated).toBe(true);
        expect(client.getQueryState(otherManagers)?.isInvalidated).toBe(false);
    });

    it.each([
        [403, "forbidden"],
        [404, "missing"],
        [409, "conflict"],
        [400, "invalid"],
        [503, "unavailable"],
        [500, "requestFailed"],
    ])("maps %s to fixed localized copy without echoing problem details", async (status, key) => {
        api.setGrant.mockResolvedValue(failure(status));
        const { result } = renderHook(() => useSetPartyLocationManagementGrant(), { wrapper });

        await expect(
            act(() =>
                result.current.mutateAsync({ partyId: "pty_1", userId: "usr_1", granted: true }),
            ),
        ).rejects.toMatchObject({
            status,
            message: testI18n.t(`adminParties.locationAccess.errors.${key}`),
        });
    });

    it("refreshes the organization and its locations when either is unavailable", async () => {
        api.setGrant.mockResolvedValue(failure(404));
        const { target, detail, managers } = seed();
        const { result } = renderHook(() => useSetPartyLocationManagementGrant(), { wrapper });

        await act(() =>
            result.current
                .mutateAsync({ partyId: "pty_1", userId: "usr_1", granted: false })
                .catch(() => undefined),
        );

        expect(client.getQueryState(detail)?.isInvalidated).toBe(true);
        expect(client.getQueryState(target)?.isInvalidated).toBe(true);
        expect(client.getQueryState(managers)?.isInvalidated).toBe(true);
    });

    it("treats a missing response as an unconfirmed change", async () => {
        api.setGrant.mockResolvedValue({ error: new TypeError("Failed to fetch") });
        const { result } = renderHook(() => useSetPartyLocationManagementGrant(), { wrapper });

        await expect(
            act(() =>
                result.current.mutateAsync({ partyId: "pty_1", userId: "usr_1", granted: true }),
            ),
        ).rejects.toMatchObject({
            status: undefined,
            message: testI18n.t("adminParties.locationAccess.errors.requestFailed"),
        });
    });
});
