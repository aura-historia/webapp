import { ShopSortModeSelection } from "@/components/search/ShopSortModeSelection.tsx";
import type { ShopSortMode } from "@/data/internal/search/ShopSortMode.ts";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("ShopSortModeSelection", () => {
    const baseSortMode: ShopSortMode = { field: "RELEVANCE", order: "DESC" };

    it("renders current sort field and order translations", () => {
        render(<ShopSortModeSelection sortMode={baseSortMode} updateSortMode={vi.fn()} />);
        // German translations from the test setup
        expect(screen.getAllByText("Relevanz").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Absteigend").length).toBeGreaterThan(0);
    });

    it("invokes updateSortMode when a different field is selected", async () => {
        const user = userEvent.setup();
        const updateSortMode = vi.fn();

        render(<ShopSortModeSelection sortMode={baseSortMode} updateSortMode={updateSortMode} />);

        const [fieldTrigger] = screen.getAllByRole("combobox");
        await act(async () => {
            await user.click(fieldTrigger);
        });
        const nameOption = await screen.findByRole("option", { name: "Name" });
        await act(async () => {
            await user.click(nameOption);
        });

        expect(updateSortMode).toHaveBeenCalledWith({ field: "NAME", order: "DESC" });
    });

    it("invokes updateSortMode when the order is changed", async () => {
        const user = userEvent.setup();
        const updateSortMode = vi.fn();

        render(<ShopSortModeSelection sortMode={baseSortMode} updateSortMode={updateSortMode} />);

        const triggers = screen.getAllByRole("combobox");
        const orderTrigger = triggers[triggers.length - 1];
        await act(async () => {
            await user.click(orderTrigger);
        });
        const ascOption = await screen.findByRole("option", { name: /Aufsteigend/ });
        await act(async () => {
            await user.click(ascOption);
        });

        expect(updateSortMode).toHaveBeenCalledWith({ field: "RELEVANCE", order: "ASC" });
    });
});
