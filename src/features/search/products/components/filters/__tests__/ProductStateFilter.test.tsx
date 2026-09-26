import { ProductStateFilter } from "@/features/search/products/components/filters/ProductStateFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
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

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes).toHaveLength(LISTING_AVAILABILITIES.length);
        checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeChecked();
        });
    });
});
