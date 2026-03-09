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

            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);
            await user.type(searchInput, "updated query");

            const resetButton = screen.getByRole("button", { name: "Alle Filter zurücksetzen" });
            await user.click(resetButton);

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

            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);

            // Toggle a filter checkbox to trigger auto-apply with empty search bar
            const checkboxes = screen.getAllByRole("checkbox");
            await user.click(checkboxes[0]);

            expect(
                screen.getByRole("button", { name: "Alle Filter zurücksetzen" }),
            ).toBeInTheDocument();
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

            const searchInput = screen.getByPlaceholderText("Suche") as HTMLInputElement;
            await user.clear(searchInput);
            await user.type(searchInput, "ab");

            // Toggle a filter checkbox to trigger auto-apply with short query
            const checkboxes = screen.getAllByRole("checkbox");
            await user.click(checkboxes[0]);

            expect(
                screen.getByRole("button", { name: "Alle Filter zurücksetzen" }),
            ).toBeInTheDocument();
        });
    });
});
