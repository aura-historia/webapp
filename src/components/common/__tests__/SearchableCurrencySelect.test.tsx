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

        await user.click(screen.getByRole("button", { name: "Select currency" }));

        const search = screen.getByRole("combobox", { name: "Search currencies" });
        expect(search).toHaveFocus();
        expect(search).toHaveAttribute("aria-autocomplete", "list");
        expect(search).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);

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

        await user.click(screen.getByRole("button", { name: "Select currency" }));
        await user.type(screen.getByRole("combobox", { name: "Search currencies" }), "canadian");
        await user.keyboard("{Enter}");

        expect(onValueChange).toHaveBeenCalledWith("CAD");
    });

    it("scrolls the keyboard-highlighted option into view", async () => {
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

        await user.click(screen.getByRole("button", { name: "Select currency" }));

        const highlightedOption = screen.getByRole("option", { name: "US Dollar" });
        const scrollIntoView = vi.fn();
        Object.defineProperty(highlightedOption, "scrollIntoView", {
            configurable: true,
            value: scrollIntoView,
        });

        await user.keyboard("{ArrowDown}");

        expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    });

    it("keeps options out of the Tab sequence", async () => {
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

        await user.click(screen.getByRole("button", { name: "Select currency" }));

        for (const option of screen.getAllByRole("option")) {
            expect(option).toHaveAttribute("tabindex", "-1");
        }
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

        await user.click(screen.getByRole("button", { name: "Select currency" }));
        await user.type(screen.getByRole("combobox", { name: "Search currencies" }), "canadian");
        await user.click(document.body);
        await user.click(screen.getByRole("button", { name: "Select currency" }));

        expect(screen.getByRole("combobox", { name: "Search currencies" })).toHaveValue("");
        expect(screen.getAllByRole("option")).toHaveLength(options.length);
    });

    describe("with the extended currency catalogue", () => {
        const extendedOptions = [
            ...options,
            { value: "SEK", label: "Swedish Krona", searchTerms: ["SEK"] },
            { value: "KRW", label: "South Korean Won", searchTerms: ["₩"] },
            { value: "TWD", label: "New Taiwan Dollar", searchTerms: ["NT$"] },
            { value: "THB", label: "Thai Baht", searchTerms: ["฿"] },
        ] as const;

        function renderExtended(onValueChange = vi.fn(), value = "EUR") {
            render(
                <SearchableCurrencySelect
                    options={extendedOptions}
                    value={value}
                    onValueChange={onValueChange}
                    placeholder="Select currency"
                    searchPlaceholder="Search currencies"
                    emptyMessage="No currencies found"
                />,
            );
            return onValueChange;
        }

        it("selects a new currency option by click", async () => {
            const user = userEvent.setup();
            const onValueChange = renderExtended();

            await user.click(screen.getByRole("button", { name: "Select currency" }));
            await user.click(screen.getByRole("option", { name: "South Korean Won" }));

            expect(onValueChange).toHaveBeenCalledWith("KRW");
            expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        });

        it("marks a new currency as selected when it is the current value", async () => {
            const user = userEvent.setup();
            renderExtended(vi.fn(), "SEK");

            await user.click(screen.getByRole("button", { name: "Select currency" }));

            expect(screen.getByRole("option", { name: "Swedish Krona" })).toHaveAttribute(
                "aria-selected",
                "true",
            );
            expect(screen.getByRole("option", { name: "Euro" })).toHaveAttribute(
                "aria-selected",
                "false",
            );
        });

        it("matches a new currency by its lowercase ISO code and selects it with Enter", async () => {
            const user = userEvent.setup();
            const onValueChange = renderExtended();

            await user.click(screen.getByRole("button", { name: "Select currency" }));
            await user.type(screen.getByRole("combobox", { name: "Search currencies" }), "sek");

            expect(screen.getAllByRole("option")).toHaveLength(1);
            await user.keyboard("{Enter}");

            expect(onValueChange).toHaveBeenCalledWith("SEK");
        });

        it("matches a new currency by its symbol search term", async () => {
            const user = userEvent.setup();
            const onValueChange = renderExtended();

            await user.click(screen.getByRole("button", { name: "Select currency" }));
            await user.type(screen.getByRole("combobox", { name: "Search currencies" }), "฿");
            await user.keyboard("{Enter}");

            expect(onValueChange).toHaveBeenCalledWith("THB");
        });

        it("navigates with arrow keys across new options and selects with Enter", async () => {
            const user = userEvent.setup();
            const onValueChange = renderExtended();

            await user.click(screen.getByRole("button", { name: "Select currency" }));
            const search = screen.getByRole("combobox", { name: "Search currencies" });
            await user.type(search, "dollar");

            // US Dollar, Canadian Dollar, New Taiwan Dollar
            expect(screen.getAllByRole("option")).toHaveLength(3);
            await user.keyboard("{ArrowDown}{ArrowDown}");
            expect(search).toHaveAttribute(
                "aria-activedescendant",
                screen.getByRole("option", { name: "New Taiwan Dollar" }).id,
            );

            // Clamped at the last match
            await user.keyboard("{ArrowDown}");
            expect(search).toHaveAttribute(
                "aria-activedescendant",
                screen.getByRole("option", { name: "New Taiwan Dollar" }).id,
            );

            await user.keyboard("{Enter}");

            expect(onValueChange).toHaveBeenCalledWith("TWD");
        });

        it("shows the empty message and ignores Enter when nothing matches", async () => {
            const user = userEvent.setup();
            const onValueChange = renderExtended();

            await user.click(screen.getByRole("button", { name: "Select currency" }));
            const search = screen.getByRole("combobox", { name: "Search currencies" });
            await user.type(search, "xyz");

            expect(screen.queryAllByRole("option")).toHaveLength(0);
            expect(screen.getByText("No currencies found")).toBeInTheDocument();
            expect(search).not.toHaveAttribute("aria-activedescendant");

            await user.keyboard("{Enter}");

            expect(onValueChange).not.toHaveBeenCalled();
            expect(screen.getByRole("listbox")).toBeInTheDocument();
        });
    });
});
