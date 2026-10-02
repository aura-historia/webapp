import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    PARTNER_APPLICATIONS_QUERY_KEY,
    partnerApplicationDetailQueryKey,
    useCreatePartnerApplication,
    useWithdrawPartnerApplication,
    usePartnerApplicationDetails,
    usePartnerApplications,
} from "../usePartnerApplications.ts";
import { useApplicationListingSourceSearch } from "../useApplicationListingSourceSearch.ts";

const api = vi.hoisted(() => ({
    list: vi.fn(),
    detail: vi.fn(),
    create: vi.fn(),
    withdraw: vi.fn(),
    search: vi.fn(),
}));
vi.mock("@/client", () => ({
    getMyPartnershipApplications: api.list,
    getOwnPartnershipApplication: api.detail,
    postPartnershipApplication: api.create,
    deleteOwnPartnershipApplication: api.withdraw,
    searchPublicListingSources: api.search,
}));
vi.mock("@/hooks/common/useApiError.ts", () => ({
    useApiError: () => ({ getErrorMessage: () => "Request failed" }),
}));
const application = {
    id: "pa_1",
    state: "SUBMITTED" as const,
    proposal: { type: "EXISTING_LISTING_SOURCE" as const, listingSourceId: "ls_canonical" },
};
const response = (data: unknown, status = 200) => ({
    data,
    response: { status, ok: status < 400 },
});
describe("own application API", () => {
    let client: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);
    beforeEach(() => {
        vi.clearAllMocks();
        client = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });
    it("loads minimal own applications without admin enrichment", async () => {
        api.list.mockResolvedValue(response([application]));
        const hook = renderHook(() => usePartnerApplications(), { wrapper });
        await waitFor(() => expect(hook.result.current.data).toEqual([application]));
        expect(api.detail).not.toHaveBeenCalled();
    });
    it("supports empty lists", async () => {
        api.list.mockResolvedValue(response([]));
        const hook = renderHook(() => usePartnerApplications(), { wrapper });
        await waitFor(() => expect(hook.result.current.data).toEqual([]));
    });
    it("reads a single own application", async () => {
        api.detail.mockResolvedValue(response(application));
        const hook = renderHook(() => usePartnerApplicationDetails("pa_1"), { wrapper });
        await waitFor(() => expect(hook.result.current.data).toEqual(application));
        expect(api.detail).toHaveBeenCalledWith({ path: { partnershipApplicationId: "pa_1" } });
    });
    it("does not request a missing ID", () => {
        renderHook(() => usePartnerApplicationDetails(undefined), { wrapper });
        expect(api.detail).not.toHaveBeenCalled();
    });
    it("presents missing applications without a fallback request", async () => {
        api.detail.mockResolvedValue({
            error: { status: 404 },
            response: { status: 404, ok: false },
        });
        const hook = renderHook(() => usePartnerApplicationDetails("pa_missing"), { wrapper });
        await waitFor(() => expect(hook.result.current.error).toMatchObject({ status: 404 }));
        expect(api.list).not.toHaveBeenCalled();
    });
    it("submits a canonical existing-source ID inside proposal", async () => {
        api.create.mockResolvedValue(response(application, 201));
        const hook = renderHook(() => useCreatePartnerApplication(), { wrapper });
        await act(async () => {
            await hook.result.current.mutateAsync(application.proposal);
        });
        expect(api.create).toHaveBeenCalledWith({ body: { proposal: application.proposal } });
        expect(client.getQueryData(partnerApplicationDetailQueryKey("pa_1"))).toEqual(application);
    });
    it("submits only defined proposed party/source fields", async () => {
        const proposal = {
            type: "PROPOSED_LISTING_SOURCE" as const,
            party: { name: "Party", phone: "123", email: "contact@example.com" },
            listingSource: {
                name: "Source",
                url: "https://example.com",
                image: "https://example.com/image.png",
                requestedIngestionMethods: ["PARTNER_API" as const],
            },
        };
        api.create.mockResolvedValue(response({ ...application, proposal }, 201));
        const hook = renderHook(() => useCreatePartnerApplication(), { wrapper });
        await act(async () => {
            await hook.result.current.mutateAsync(proposal);
        });
        expect(api.create).toHaveBeenCalledWith({ body: { proposal } });
    });
    it("withdraws through DELETE and retains WITHDRAWN in list and detail", async () => {
        client.setQueryData(PARTNER_APPLICATIONS_QUERY_KEY, [application]);
        client.setQueryData(partnerApplicationDetailQueryKey("pa_1"), application);
        api.withdraw.mockResolvedValue(response(undefined, 204));
        const hook = renderHook(() => useWithdrawPartnerApplication(), { wrapper });
        await act(async () => {
            await hook.result.current.mutateAsync("pa_1");
        });
        expect(api.withdraw).toHaveBeenCalledWith({ path: { partnershipApplicationId: "pa_1" } });
        expect(client.getQueryData(PARTNER_APPLICATIONS_QUERY_KEY)).toEqual([
            { ...application, state: "WITHDRAWN" },
        ]);
        expect(client.getQueryData(partnerApplicationDetailQueryKey("pa_1"))).toEqual({
            ...application,
            state: "WITHDRAWN",
        });
    });
    it("handles body-less 409 without claiming withdrawal", async () => {
        client.setQueryData(PARTNER_APPLICATIONS_QUERY_KEY, [application]);
        api.withdraw.mockResolvedValue({ response: { status: 409, ok: false } });
        const hook = renderHook(() => useWithdrawPartnerApplication(), { wrapper });
        await act(async () => {
            await expect(hook.result.current.mutateAsync("pa_1")).rejects.toMatchObject({
                status: 409,
            });
        });
        expect(client.getQueryData(PARTNER_APPLICATIONS_QUERY_KEY)).toEqual([application]);
        expect(client.getQueryState(PARTNER_APPLICATIONS_QUERY_KEY)?.isInvalidated).toBe(true);
    });
    it("maps public search into selection data with canonical ID", async () => {
        api.search.mockResolvedValue(
            response({
                items: [
                    {
                        listingSourceId: "ls_canonical",
                        listingSourceSlugId: "navigation-slug",
                        name: "Source",
                        operator: { name: "Operator" },
                    },
                ],
            }),
        );
        const hook = renderHook(() => useApplicationListingSourceSearch(" Source "), { wrapper });
        await waitFor(() =>
            expect(hook.result.current.data).toEqual([
                { listingSourceId: "ls_canonical", name: "Source", operatorName: "Operator" },
            ]),
        );
        expect(api.search).toHaveBeenCalledWith({ query: { query: "Source", size: 10 } });
    });
});
