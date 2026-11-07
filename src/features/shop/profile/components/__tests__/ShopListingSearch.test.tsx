import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SHOP_SEARCH_DEBOUNCE_MS, ShopListingSearch } from "../ShopListingSearch.tsx";

const MIN_QUERY_MESSAGE = "Bitte geben Sie mindestens 3 Zeichen ein, um die Suche zu starten.";

function renderSearch(query = "") {
    const onSearch = vi.fn();
    const view = render(
        <ShopListingSearch
            providerName="Antique Store"
            query={query}
            onSearch={onSearch}
            resultsId="results"
        />,
    );
    const rerenderWithQuery = (next: string) =>
        view.rerender(
            <ShopListingSearch
                providerName="Antique Store"
                query={next}
                onSearch={onSearch}
                resultsId="results"
            />,
        );
    return { onSearch, rerenderWithQuery };
}

function field() {
    return screen.getByRole("searchbox", { name: "Angebote von Antique Store durchsuchen" });
}

function type(value: string) {
    fireEvent.change(field(), { target: { value } });
}

function advance(ms: number) {
    act(() => {
        vi.advanceTimersByTime(ms);
    });
}

describe("ShopListingSearch", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("labels the search with the provider name", () => {
        renderSearch();

        expect(
            screen.getByRole("search", { name: "Angebote von Antique Store durchsuchen" }),
        ).toBeInTheDocument();
        expect(field()).toHaveAttribute("placeholder", "Angebote dieses Anbieters durchsuchen");
        expect(field()).toHaveAttribute("aria-controls", "results");
        expect(screen.getByRole("button", { name: "Suchen" })).toBeInTheDocument();
    });

    it("starts with the active query and does not search on mount", () => {
        const { onSearch } = renderSearch("vase");
        advance(SHOP_SEARCH_DEBOUNCE_MS);

        expect(field()).toHaveValue("vase");
        expect(onSearch).not.toHaveBeenCalled();
    });

    it("does not search on mount without a query", () => {
        const { onSearch } = renderSearch();
        advance(SHOP_SEARCH_DEBOUNCE_MS);

        expect(onSearch).not.toHaveBeenCalled();
    });

    it("searches a typed term after the debounce", () => {
        const { onSearch } = renderSearch();

        type("vase");
        advance(SHOP_SEARCH_DEBOUNCE_MS - 1);
        expect(onSearch).not.toHaveBeenCalled();

        advance(1);
        expect(onSearch).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith("vase");
    });

    it("trims the typed term", () => {
        const { onSearch } = renderSearch();

        type("  vase  ");
        advance(SHOP_SEARCH_DEBOUNCE_MS);

        expect(onSearch).toHaveBeenCalledWith("vase");
    });

    it("restarts the debounce on every keystroke", () => {
        const { onSearch } = renderSearch();

        type("vas");
        advance(200);
        type("vase");
        advance(200);
        expect(onSearch).not.toHaveBeenCalled();

        advance(SHOP_SEARCH_DEBOUNCE_MS - 200);
        expect(onSearch).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith("vase");
    });

    it("never searches fewer than three characters while typing", () => {
        const { onSearch } = renderSearch();

        type("va");
        advance(SHOP_SEARCH_DEBOUNCE_MS * 2);

        expect(onSearch).not.toHaveBeenCalled();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("restores the full list at once when the field is emptied", () => {
        const { onSearch } = renderSearch("vase");

        type("");

        expect(onSearch).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith("");
    });

    it("treats a whitespace-only field as empty", () => {
        const { onSearch } = renderSearch("vase");

        type("   ");

        expect(onSearch).toHaveBeenCalledWith("");
    });

    it("searches at once on Enter", () => {
        const { onSearch } = renderSearch();

        type("vase");
        fireEvent.submit(screen.getByRole("search"));

        expect(onSearch).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith("vase");
    });

    it("does not send the same term again after the debounce", () => {
        const { onSearch } = renderSearch();

        type("vase");
        fireEvent.submit(screen.getByRole("search"));
        advance(SHOP_SEARCH_DEBOUNCE_MS);
        fireEvent.submit(screen.getByRole("search"));

        expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("does not re-send the active query on Enter", () => {
        const { onSearch } = renderSearch("vase");

        fireEvent.submit(screen.getByRole("search"));

        expect(onSearch).not.toHaveBeenCalled();
    });

    it("explains the minimum length when Enter is pressed with one or two characters", () => {
        const { onSearch } = renderSearch();

        type("va");
        fireEvent.submit(screen.getByRole("search"));

        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent(MIN_QUERY_MESSAGE);
        expect(field()).toHaveAttribute("aria-invalid", "true");
        expect(field()).toHaveAttribute("aria-describedby", alert.id);
        expect(onSearch).not.toHaveBeenCalled();
    });

    it("hides the minimum-length hint once the reader types again", () => {
        renderSearch();

        type("va");
        fireEvent.submit(screen.getByRole("search"));
        type("vas");

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(field()).toHaveAttribute("aria-invalid", "false");
        expect(field()).not.toHaveAttribute("aria-describedby");
    });

    it("shows the clear button only when the field has text", () => {
        renderSearch();
        expect(screen.queryByRole("button", { name: "Suche löschen" })).not.toBeInTheDocument();

        type("v");
        expect(screen.getByRole("button", { name: "Suche löschen" })).toBeInTheDocument();
    });

    it("clears the field, restores the full list and keeps focus in the field", () => {
        const { onSearch } = renderSearch("vase");

        fireEvent.click(screen.getByRole("button", { name: "Suche löschen" }));

        expect(field()).toHaveValue("");
        expect(field()).toHaveFocus();
        expect(onSearch).toHaveBeenCalledWith("");
        expect(screen.queryByRole("button", { name: "Suche löschen" })).not.toBeInTheDocument();
    });

    it("clears the minimum-length hint", () => {
        renderSearch();

        type("va");
        fireEvent.submit(screen.getByRole("search"));
        fireEvent.click(screen.getByRole("button", { name: "Suche löschen" }));

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("takes a query changed from outside without searching it again", () => {
        const { onSearch, rerenderWithQuery } = renderSearch("vase");

        rerenderWithQuery("lamp");
        advance(SHOP_SEARCH_DEBOUNCE_MS);

        expect(field()).toHaveValue("lamp");
        expect(onSearch).not.toHaveBeenCalled();
    });

    it("empties the field when the query is cleared from outside", () => {
        const { onSearch, rerenderWithQuery } = renderSearch();

        type("vase");
        advance(SHOP_SEARCH_DEBOUNCE_MS);
        expect(onSearch).toHaveBeenCalledWith("vase");
        rerenderWithQuery("vase");

        rerenderWithQuery("");
        advance(SHOP_SEARCH_DEBOUNCE_MS);

        expect(field()).toHaveValue("");
        expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("drops a pending debounced search when the query changes from outside", () => {
        const { onSearch, rerenderWithQuery } = renderSearch("vase");

        type("lamp");
        rerenderWithQuery("");
        advance(SHOP_SEARCH_DEBOUNCE_MS);

        expect(field()).toHaveValue("");
        expect(onSearch).not.toHaveBeenCalled();
    });
});
