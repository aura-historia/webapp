import { ProductStateFilter } from "@/features/search/products/components/filters/ProductStateFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { LISTING_AVAILABILITIES } from "@/data/internal/product/ListingAvailability.ts";

vi.mock("@/features/search/products/hooks/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

const FormWrapper = ({
    children,
    defaultValues = LISTING_AVAILABILITIES,
}: {
    children: React.ReactNode;
    defaultValues?: readonly string[];
}) => {
    const methods = useForm({ defaultValues: { availability: [...defaultValues] } });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ProductStateFilter", () => {
    it("renders canonical listing availability options selected by default", () => {
        render(
            <FormWrapper>
                <ProductStateFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Verfügbarkeit")).toBeInTheDocument();
        expect(screen.getByText("Auf Lager")).toBeInTheDocument();
        expect(screen.getByText("Ausverkauft")).toBeInTheDocument();

        expect(screen.getByText("Alle")).toBeInTheDocument();
        expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    });

    it('shows every state behind "Show all" and keeps them checked', async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper>
                <ProductStateFilter />
            </FormWrapper>,
        );

        await user.click(screen.getByRole("button", { name: "Alle 11 anzeigen" }));

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(LISTING_AVAILABILITIES.length);
        for (const checkbox of checkboxes) {
            expect(checkbox).toBeChecked();
        }
    });

    it("summarises a partial selection and does not uncheck the last state", async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper defaultValues={["AVAILABLE"]}>
                <ProductStateFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("1 von 11")).toBeInTheDocument();
        const available = screen.getByRole("checkbox", { name: "Verfügbar" });
        await user.click(available);
        expect(available).toBeChecked();
    });
});
