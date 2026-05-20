import { SellerIncludeFilter } from "@/components/search/filters/SellerIncludeFilter";
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
            seller: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("SellerIncludeFilter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with correct heading and placeholder", () => {
        render(
            <FormWrapper>
                <SellerIncludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Verkäufer")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Verkäufer suchen...")).toBeInTheDocument();
    });

    it("allows entering search text in the input", async () => {
        render(
            <FormWrapper>
                <SellerIncludeFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Verkäufer suchen...");

        await user.type(input, "Hermann Historica");

        expect(input).toHaveValue("Hermann Historica");
    });

    it("shows pre-populated seller values as badges when provided", () => {
        render(
            <FormWrapper defaultValues={{ seller: ["Hermann Historica"] }}>
                <SellerIncludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Hermann Historica")).toBeInTheDocument();
    });

    it("displays multiple selected sellers as badges", () => {
        render(
            <FormWrapper defaultValues={{ seller: ["Seller One", "Seller Two"] }}>
                <SellerIncludeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Seller One")).toBeInTheDocument();
        expect(screen.getByText("Seller Two")).toBeInTheDocument();
    });
});
