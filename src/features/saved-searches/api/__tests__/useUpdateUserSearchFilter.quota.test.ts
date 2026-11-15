import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdateUserSearchFilter = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock("@/client", () => ({ updateUserSearchFilter: mockUpdateUserSearchFilter }));
vi.mock("sonner", () => ({ toast: { error: mockToastError } }));

import { useUpdateUserSearchFilter } from "../useUpdateUserSearchFilter.ts";

/** Real error mapping and translations: resuming a paused filter at the plan limit. */
describe("useUpdateUserSearchFilter at the quota", () => {
    let queryClient: QueryClient;
    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
    });

    it("tells the user the active-filter limit is reached when resuming is refused", async () => {
        mockUpdateUserSearchFilter.mockResolvedValue({
            data: undefined,
            error: {
                status: 422,
                title: "Unprocessable Entity",
                error: "SEARCH_FILTER_QUOTA_EXCEEDED",
            },
        });

        const { result } = renderHook(() => useUpdateUserSearchFilter(), { wrapper });

        await act(async () => {
            result.current.mutate({ id: "filter-1", patch: { state: "ACTIVE" } });
        });

        await waitFor(() =>
            expect(mockToastError).toHaveBeenCalledWith(
                "Sie haben die maximale Anzahl aktiver Suchaufträge für Ihren Account erreicht.",
            ),
        );
        expect(mockUpdateUserSearchFilter).toHaveBeenCalledWith({
            path: { userSearchFilterId: "filter-1" },
            body: expect.objectContaining({ state: "ACTIVE" }),
        });
    });
});
