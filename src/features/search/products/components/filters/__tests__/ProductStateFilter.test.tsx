import { ProductStateFilter } from "@/features/search/products/components/filters/ProductStateFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { SEARCHABLE_LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

vi.mock("@/features/search/products/hooks/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

const FormWrapper = ({
    children,
    defaultValues = SEARCHABLE_LISTING_AVAILABILITIES,
}: {
    children: React.ReactNode;
    defaultValues?: readonly string[];
}) => {
    const methods = useForm({ defaultValues: { availability: [...defaultValues] } });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ProductStateFilter", () => {
    it("renders the searchable availability options selected by default", () => {
        render(
            <FormWrapper>
                <ProductStateFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Verfügbarkeit")).toBeInTheDocument();
        expect(screen.getByText("Auf Lager")).toBeInTheDocument();
        expect(screen.getByText("Reserviert")).toBeInTheDocument();

        expect(screen.getByText("Alle")).toBeInTheDocument();
        expect(screen.getAllByRole("checkbox")).toHaveLength(4);
    });

    it('shows every searchable state behind "Show all" and keeps them checked', async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper>
                <ProductStateFilter />
            </FormWrapper>,
        );

        await user.click(screen.getByRole("button", { name: "Alle 8 anzeigen" }));

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(SEARCHABLE_LISTING_AVAILABILITIES.length);
        for (const checkbox of checkboxes) {
            expect(checkbox).toBeChecked();
        }
    });

    it('does not offer out-of-stock, unavailable or sold-out, even behind "Show all"', async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper>
                <ProductStateFilter />
            </FormWrapper>,
        );

        const removed = ["Ausverkauft", "Nicht verfügbar", "Nicht auf Lager"];
        for (const label of removed) {
            expect(screen.queryByRole("checkbox", { name: label })).not.toBeInTheDocument();
        }

        await user.click(screen.getByRole("button", { name: "Alle 8 anzeigen" }));

        for (const label of removed) {
            expect(screen.queryByRole("checkbox", { name: label })).not.toBeInTheDocument();
        }
    });

    it("summarises a partial selection and does not uncheck the last state", async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper defaultValues={["AVAILABLE"]}>
                <ProductStateFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("1 von 8")).toBeInTheDocument();
        const available = screen.getByRole("checkbox", { name: "Verfügbar" });
        await user.click(available);
        expect(available).toBeChecked();
    });
});
