import { SellerExcludeFilter } from "@/components/search/filters/SellerExcludeFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type React from "react";

const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const methods = useForm({
        defaultValues: {
            excludeSeller: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("SellerExcludeFilter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with correct heading and placeholder", () => {
        render(
            <FormWrapper>
                <SellerExcludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Verkäufer ausschließen")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Auszuschließende Verkäufer suchen..."),
        ).toBeInTheDocument();
    });

    it("allows entering search text in the input", async () => {
        render(
            <FormWrapper>
                <SellerExcludeFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Auszuschließende Verkäufer suchen...");

        await user.type(input, "Excluded Seller");

        expect(input).toHaveValue("Excluded Seller");
    });

    it("shows pre-populated excludeSeller values as badges when provided", () => {
        render(
            <FormWrapper defaultValues={{ excludeSeller: ["Excluded Seller"] }}>
                <SellerExcludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Excluded Seller")).toBeInTheDocument();
    });

    it("displays multiple selected sellers as badges", () => {
        render(
            <FormWrapper defaultValues={{ excludeSeller: ["Seller One", "Seller Two"] }}>
                <SellerExcludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Seller One")).toBeInTheDocument();
        expect(screen.getByText("Seller Two")).toBeInTheDocument();
    });
});
