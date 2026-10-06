import { SearchFilters } from "@/features/search/products/components/SearchFilters.tsx";
import { SearchBar } from "@/features/search/common/components/SearchBar.tsx";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expandFilterCard, renderWithRouter } from "@/test/utils.tsx";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";
import {
    Outlet,
    RouterProvider,
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchQueryProvider } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import { UserPreferencesProvider } from "@/features/preferences/hooks/useUserPreferences.tsx";
import {
    validateSearchParams,
    validateSearchUrlParams,
} from "@/features/search/products/lib/searchValidation.ts";
import { DEBOUNCE_DELAY_MS } from "@/features/search/common/lib/filterForm.ts";

async function renderSearchPage(entry: string) {
    const root = createRootRoute({ component: Outlet });
    const search = createRoute({
        getParentRoute: () => root,
        path: "/$lng/search",
        validateSearch: validateSearchUrlParams,
        component: () => (
            <>
                <SearchBar type="small" />
                <SearchFilters searchFilters={validateSearchParams(search.useSearch())} />
            </>
        ),
    });
    const router = createRouter({
        routeTree: root.addChildren([search]),
        history: createMemoryHistory({ initialEntries: [entry] }),
    });
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
        render(
            <SearchQueryProvider>
                <UserPreferencesProvider locale="de-DE">
                    <QueryClientProvider client={queryClient}>
                        <RouterProvider router={router} />
                    </QueryClientProvider>
                </UserPreferencesProvider>
            </SearchQueryProvider>,
        );
        await router.load();
    });
    return router;
}

describe("SearchFilters", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("clears dirty filters from both the form and URL and keeps them cleared on the next edit", async () => {
        const router = await renderSearchPage(
            "/de/search?q=chair&priceFrom=100&priceTo=500&listingSourceId=ls_1&creationDateFrom=1900-01-01&auctionDateTo=2026-04-01&excludeProductId=pl_1",
        );
        const min = screen.getByPlaceholderText("Min");
        expandFilterCard("Hinzugefügt");
        expandFilterCard("Auktionsdatum");
        expect(screen.getAllByText("Beliebig")).toHaveLength(2);
        fireEvent.change(min, { target: { value: "200" } });
        await user.click(screen.getAllByRole("checkbox")[0]);
        await waitFor(() => expect(router.state.location.search.priceFrom).toBe(200));

        await user.click(screen.getByRole("button", { name: "Alle Filter zurücksetzen" }));

        await waitFor(() => {
            expect(screen.getByPlaceholderText("Min")).toHaveValue("");
            expect(screen.getByPlaceholderText("Max")).toHaveValue("");
            expect(screen.getAllByText("Beliebig")).toHaveLength(4);
            for (const checkbox of screen.getAllByRole("checkbox")) {
                expect(checkbox).toBeChecked();
            }
            expect(router.state.location.search).toEqual({
                q: "chair",
                sortField: "RELEVANCE",
                sortOrder: "DESC",
            });
        });

        await user.click(screen.getAllByRole("checkbox")[0]);
        await waitFor(() => {
            expect(router.state.location.search.availability).toHaveLength(
                LISTING_AVAILABILITIES.length - 1,
            );
            expect(router.state.location.search.priceFrom).toBeUndefined();
            expect(router.state.location.search.listingSourceId).toBeUndefined();
            expect(router.state.location.search.creationDateFrom).toBeUndefined();
            expect(router.state.location.search.auctionDateTo).toBeUndefined();
        });
    });

    it.each(["/de/search?q=chair", "/de/search?q=chair&priceFrom=100"])(
        "cancels a pending debounced price update when resetting all filters on %s",
        async (entry) => {
            const router = await renderSearchPage(entry);
            vi.useFakeTimers();
            fireEvent.change(screen.getByPlaceholderText("Min"), { target: { value: "250" } });
            fireEvent.click(screen.getByRole("button", { name: "Alle Filter zurücksetzen" }));

            await act(async () => {
                await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY_MS + 100);
            });
            expect(screen.getByPlaceholderText("Min")).toHaveValue("");
            expect(router.state.location.search.priceFrom).toBeUndefined();
            expect(router.state.location.search.q).toBe("chair");
        },
    );

    it("preserves date ranges when submitting an updated search query", async () => {
        const router = await renderSearchPage(
            "/de/search?q=chair&creationDateFrom=1900-01-01&updateDateTo=2026-02-01&auctionDateFrom=2026-03-01&auctionDateTo=2026-04-01",
        );
        const input = screen.getByPlaceholderText("Suche");
        await user.clear(input);
        await user.type(input, "antique vase");
        fireEvent.submit(input.closest("form") as HTMLFormElement);

        await waitFor(() => {
            expect(router.state.location.search).toMatchObject({
                q: "antique vase",
                creationDateFrom: "1900-01-01T00:00:00.000Z",
                updateDateTo: "2026-02-01T00:00:00.000Z",
                auctionDateFrom: "2026-03-01T00:00:00.000Z",
                auctionDateTo: "2026-04-01T00:00:00.000Z",
            });
        });
    });

    describe("Apply filters with updated search query", () => {
        it("should use the current search bar query when applying filters", async () => {
            await act(async () => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query"] },
                );
            });

            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            expect(searchInput.value).toBe("original query");

            await user.clear(searchInput);
            await user.type(searchInput, "new search query");
            expect(searchInput.value).toBe("new search query");

            // Toggle a filter checkbox to trigger auto-apply with the new query
            const checkboxes = screen.getAllByRole("checkbox");
            await user.click(checkboxes[0]);

            await waitFor(() => {
                const currentSearchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
                expect(currentSearchInput.value).toBe("new search query");
            });
        }, 10000);

        it("should use the current search bar query when resetting filters", async () => {
            await act(async () => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                                priceFrom: 100,
                                priceTo: 500,
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query&priceFrom=100&priceTo=500"] },
                );
            });

            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);
            await user.type(searchInput, "updated query");

            const resetButton = screen.getByRole("button", { name: "Alle Filter zurücksetzen" });
            await user.click(resetButton);

            await waitFor(() => {
                const currentSearchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
                expect(currentSearchInput.value).toBe("updated query");
            });
        }, 10000);

        it("should fall back to URL query when search bar input is empty", async () => {
            await act(async () => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query"] },
                );
            });

            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);

            // Toggle a filter checkbox to trigger auto-apply with empty search bar
            const checkboxes = screen.getAllByRole("checkbox");
            await user.click(checkboxes[0]);

            expect(
                screen.getByRole("button", { name: "Alle Filter zurücksetzen" }),
            ).toBeInTheDocument();
        }, 10000);

        it("should fall back to URL query when search bar input has less than 3 characters", async () => {
            await act(async () => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query"] },
                );
            });

            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);
            await user.type(searchInput, "ab");

            // Toggle a filter checkbox to trigger auto-apply with short query
            const checkboxes = screen.getAllByRole("checkbox");
            await user.click(checkboxes[0]);

            expect(
                screen.getByRole("button", { name: "Alle Filter zurücksetzen" }),
            ).toBeInTheDocument();
        }, 10000);
    });
});
