import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListingSourceTypeField } from "../ListingSourceTypeField.tsx";

function renderField(
    props: Partial<Parameters<typeof ListingSourceTypeField>[0]> = {},
    disabled = false,
) {
    const onChange = vi.fn();
    render(
        <fieldset disabled={disabled}>
            <ListingSourceTypeField
                name="listingSourceType"
                value=""
                onChange={onChange}
                onBlur={vi.fn()}
                inputRef={vi.fn<(element: HTMLInputElement | null) => void>()}
                {...props}
            />
        </fieldset>,
    );
    return { onChange };
}

describe("ListingSourceTypeField", () => {
    it("offers the four types, unchosen, named by their titles and described by their lines", () => {
        renderField();
        expect(screen.getByRole("group", { name: "Art des Anbieters" })).toBeInTheDocument();
        const radios = screen.getAllByRole("radio");
        expect(radios.map((radio) => radio.getAttribute("value"))).toEqual([
            "DEALER",
            "AUCTION_HOUSE",
            "MARKETPLACE",
            "AUCTION_PLATFORM",
        ]);
        expect(radios.every((radio) => !(radio as HTMLInputElement).checked)).toBe(true);
        expect(screen.getByRole("radio", { name: "Marktplatz" })).toHaveAccessibleDescription(
            "Bietet anderen Verkäufern Raum für Festpreisangebote.",
        );
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("chooses a type from anywhere on its card", async () => {
        const { onChange } = renderField();
        await userEvent.click(screen.getByText("Bietet anderen Verkäufern Raum für Auktionen."));
        expect(onChange).toHaveBeenCalledWith("AUCTION_PLATFORM");
    });

    it("shows the chosen type as checked", () => {
        renderField({ value: "AUCTION_HOUSE" });
        expect(screen.getByRole("radio", { name: "Auktionshaus" })).toBeChecked();
        expect(screen.getByRole("radio", { name: "Händler" })).not.toBeChecked();
    });

    it("hands the first option to the form so a missing choice can focus it", () => {
        const inputRef = vi.fn<(element: HTMLInputElement | null) => void>();
        renderField({ inputRef });
        expect(inputRef).toHaveBeenCalledWith(screen.getByRole("radio", { name: "Händler" }));
    });

    it("announces the error and describes every option with it", () => {
        renderField({ error: "Wählen Sie die Art des Anbieters aus." });
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Wählen Sie die Art des Anbieters aus.",
        );
        for (const radio of screen.getAllByRole("radio")) {
            expect(radio).toHaveAccessibleDescription(/Wählen Sie die Art des Anbieters aus\.$/);
        }
    });

    it("is disabled with an enclosing fieldset", () => {
        renderField({ value: "DEALER" }, true);
        for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    });
});
