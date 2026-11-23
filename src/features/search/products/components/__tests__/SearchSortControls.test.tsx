import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchSortControls } from "@/features/search/products/components/SearchSortControls.tsx";
import { chooseSelectOption } from "@/test/utils.tsx";

describe("SearchSortControls", () => {
    it("switches an ordinary sort between ascending and descending", async () => {
        const onChange = vi.fn();
        render(
            <SearchSortControls
                sortMode={{ field: "CREATION_DATE", order: "ASC" }}
                onChange={onChange}
                layout="toolbar"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", {
                name: "Reihenfolge: aufsteigend. Auf absteigend umstellen",
            }),
        );
        expect(onChange).toHaveBeenCalledWith({ field: "CREATION_DATE", order: "DESC" });
    });

    it("reads a distance sort as nearest or farthest first", async () => {
        const onChange = vi.fn();
        render(
            <SearchSortControls
                sortMode={{ field: "DISTANCE", order: "DESC" }}
                onChange={onChange}
                layout="toolbar"
                distance={{ enabled: true }}
            />,
        );

        expect(screen.getByText("Entfernteste zuerst")).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole("button", {
                name: "Reihenfolge: entfernteste zuerst. Zu nächste zuerst wechseln",
            }),
        );
        expect(onChange).toHaveBeenCalledWith({ field: "DISTANCE", order: "ASC" });
    });

    it("starts a distance sort nearest first", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <SearchSortControls
                sortMode={{ field: "CREATION_DATE", order: "DESC" }}
                onChange={onChange}
                layout="toolbar"
                distance={{ enabled: true }}
            />,
        );

        await chooseSelectOption(user, screen.getByRole("combobox"), "Entfernung");
        expect(onChange).toHaveBeenCalledWith({ field: "DISTANCE", order: "ASC" });
    });
});
