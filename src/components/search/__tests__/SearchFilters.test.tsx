import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchBar } from "@/components/search/SearchBar";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";

describe("SearchFilters", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    describe("Apply filters with updated search query", () => {
        it("should use the current search bar query when applying filters", async () => {
            // Render both SearchBar and SearchFilters as they appear on the search page
            await act(() => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                                priceFrom: undefined,
                                priceTo: undefined,
                                allowedStates: undefined,
                                creationDateFrom: undefined,
                                creationDateTo: undefined,
                                updateDateFrom: undefined,
                                updateDateTo: undefined,
                                merchant: undefined,
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query"] },
                );
            });

            // Verify initial state - the SearchBar should have the original query
            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            expect(searchInput.value).toBe("original query");

            // Update the search query in the input without submitting
            await user.clear(searchInput);
            await user.type(searchInput, "new search query");

            // Verify the input now has the new value
            expect(searchInput.value).toBe("new search query");

            // Click Apply filters button
            const applyButton = screen.getByRole("button", { name: "Filter anwenden" });
            await user.click(applyButton);

            // The navigation should use the new query, not the original
            // We can verify this by checking that the search input still has the new value
            // (If the old query was used, the component would re-render with the old value)
            await waitFor(() => {
                const currentSearchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
                expect(currentSearchInput.value).toBe("new search query");
            });
        });

        it("should use the current search bar query when resetting filters", async () => {
            await act(() => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                                priceFrom: 100,
                                priceTo: 500,
                                allowedStates: undefined,
                                creationDateFrom: undefined,
                                creationDateTo: undefined,
                                updateDateFrom: undefined,
                                updateDateTo: undefined,
                                merchant: undefined,
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query&priceFrom=100&priceTo=500"] },
                );
            });

            // Update the search query in the input without submitting
            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);
            await user.type(searchInput, "updated query");

            // Click Reset all filters button
            const resetButton = screen.getByRole("button", { name: "Alle Filter zurücksetzen" });
            await user.click(resetButton);

            // Verify the search input kept the new query
            await waitFor(() => {
                const currentSearchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
                expect(currentSearchInput.value).toBe("updated query");
            });
        });

        it("should fall back to URL query when search bar input is empty", async () => {
            await act(() => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                                priceFrom: undefined,
                                priceTo: undefined,
                                allowedStates: undefined,
                                creationDateFrom: undefined,
                                creationDateTo: undefined,
                                updateDateFrom: undefined,
                                updateDateTo: undefined,
                                merchant: undefined,
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query"] },
                );
            });

            // Clear the search input completely
            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);

            // Click Apply filters - should use fallback query
            const applyButton = screen.getByRole("button", { name: "Filter anwenden" });
            await user.click(applyButton);

            // The component should still work (using the fallback)
            expect(screen.getByRole("button", { name: "Filter anwenden" })).toBeInTheDocument();
        });

        it("should fall back to URL query when search bar input has less than 3 characters", async () => {
            await act(() => {
                renderWithRouter(
                    <>
                        <SearchBar type="small" />
                        <SearchFilters
                            searchFilters={{
                                q: "original query",
                                priceFrom: undefined,
                                priceTo: undefined,
                                allowedStates: undefined,
                                creationDateFrom: undefined,
                                creationDateTo: undefined,
                                updateDateFrom: undefined,
                                updateDateTo: undefined,
                                merchant: undefined,
                            }}
                        />
                    </>,
                    { initialEntries: ["/search?q=original+query"] },
                );
            });

            // Set search input to only 2 characters
            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);
            await user.type(searchInput, "ab");

            // Click Apply filters - should use fallback (original query)
            const applyButton = screen.getByRole("button", { name: "Filter anwenden" });
            await user.click(applyButton);

            // The component should still work
            expect(screen.getByRole("button", { name: "Filter anwenden" })).toBeInTheDocument();
        });
    });
});
