import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import { geographyQueryKeys } from "@/data/internal/geography/GeographyQueryKeys.ts";
import { adminPartyDetailQueryKey } from "../useAdminParties.ts";
import { useSetPartyLocationManagementGrant } from "../usePartyLocationManagementGrant.ts";

const api = vi.hoisted(() => ({ setGrant: vi.fn() }));
vi.mock("@/client", () => ({ setPartyLocationManagementGrant: api.setGrant }));

const noContent = () => ({ data: {}, response: { status: 204, ok: true } });
const failure = (status: number) => ({
    error: { status, title: "Problem", error: "PROBLEM", detail: "user@example.test" },
    response: { status, ok: false },
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
        for (const key of [target, otherParty, detail]) client.setQueryData(key, {});
        return { target, otherParty, detail };
    }

    it.each([true, false])("sends an explicit { granted: %s } command", async (granted) => {
        api.setGrant.mockResolvedValue(noContent());
        const { target, otherParty } = seed();
        const { result } = renderHook(() => useSetPartyLocationManagementGrant(), { wrapper });

        await act(() => result.current.mutateAsync({ partyId: "pty_1", userId: "usr_1", granted }));

        expect(api.setGrant).toHaveBeenCalledWith({
            path: { party_id: "pty_1", user_id: "usr_1" },
            body: { granted },
            cache: "no-store",
        });
        expect(client.getQueryState(target)?.isInvalidated).toBe(true);
        expect(client.getQueryState(otherParty)?.isInvalidated).toBe(false);
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
        const { target, detail } = seed();
        const { result } = renderHook(() => useSetPartyLocationManagementGrant(), { wrapper });

        await act(() =>
            result.current
                .mutateAsync({ partyId: "pty_1", userId: "usr_1", granted: false })
                .catch(() => undefined),
        );

        expect(client.getQueryState(detail)?.isInvalidated).toBe(true);
        expect(client.getQueryState(target)?.isInvalidated).toBe(true);
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
