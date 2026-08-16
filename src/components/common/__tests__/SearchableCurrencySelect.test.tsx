import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchableCurrencySelect } from "../SearchableCurrencySelect.tsx";

const options = [
    { value: "EUR", label: "Euro", searchTerms: ["€"] },
    { value: "USD", label: "US Dollar", searchTerms: ["$"] },
    { value: "CAD", label: "Canadian Dollar", searchTerms: ["C$"] },
] as const;

describe("SearchableCurrencySelect", () => {
    it("focuses its search field when opened and filters with an infix query", async () => {
        const user = userEvent.setup();

        render(
            <SearchableCurrencySelect
                options={options}
                value="EUR"
                onValueChange={vi.fn()}
                placeholder="Select currency"
                searchPlaceholder="Search currencies"
                emptyMessage="No currencies found"
            />,
        );

        await user.click(screen.getByRole("combobox"));

        const search = screen.getByRole("searchbox", { name: "Search currencies" });
        expect(search).toHaveFocus();

        await user.type(search, "llar");

        expect(screen.getByRole("option", { name: "US Dollar" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Canadian Dollar" })).toBeInTheDocument();
        expect(screen.queryByRole("option", { name: "Euro" })).not.toBeInTheDocument();
    });

    it("selects the highlighted match with Enter", async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();

        render(
            <SearchableCurrencySelect
                options={options}
                value="EUR"
                onValueChange={onValueChange}
                placeholder="Select currency"
                searchPlaceholder="Search currencies"
                emptyMessage="No currencies found"
            />,
        );

        await user.click(screen.getByRole("combobox"));
        await user.type(screen.getByRole("searchbox"), "canadian");
        await user.keyboard("{Enter}");

        expect(onValueChange).toHaveBeenCalledWith("CAD");
    });

    it("resets the search when reopened, rather than while it closes", async () => {
        const user = userEvent.setup();

        render(
            <SearchableCurrencySelect
                options={options}
                value="EUR"
                onValueChange={vi.fn()}
                placeholder="Select currency"
                searchPlaceholder="Search currencies"
                emptyMessage="No currencies found"
            />,
        );

        await user.click(screen.getByRole("combobox"));
        await user.type(screen.getByRole("searchbox"), "canadian");
        await user.click(document.body);
        await user.click(screen.getByRole("combobox"));

        expect(screen.getByRole("searchbox")).toHaveValue("");
        expect(screen.getAllByRole("option")).toHaveLength(options.length);
    });
});
