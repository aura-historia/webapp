import { MerchantFilter } from "@/components/search/filters/MerchantFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type React from "react";

vi.mock("@/hooks/search/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));
// Wrapper component to provide form context for tests
const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const methods = useForm({
        defaultValues: {
            merchant: undefined,
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("MerchantFilter", () => {
    it("renders with correct heading and placeholder", () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Händler")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Beliebiger Händler")).toBeInTheDocument();
    });

    it("allows entering merchant text", async () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Beliebiger Händler");

        await user.type(input, "Test Merchant");

        expect(input).toHaveValue("Test Merchant");
    });

    it("shows pre-populated merchant value when provided", () => {
        render(
            <FormWrapper defaultValues={{ merchant: "Existing Merchant" }}>
                <MerchantFilter />
            </FormWrapper>,
        );

        const input = screen.getByPlaceholderText("Beliebiger Händler");
        expect(input).toHaveValue("Existing Merchant");
    });

    it("handles special characters in merchant name", async () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Beliebiger Händler");

        await user.type(input, "Special & Chars #123!");

        expect(input).toHaveValue("Special & Chars #123!");
    });

    it("clears input correctly", async () => {
        render(
            <FormWrapper defaultValues={{ merchant: "Initial Value" }}>
                <MerchantFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Beliebiger Händler");

        // Clear the input by selecting all and deleting
        await user.clear(input);

        expect(input).toHaveValue("");
    });

    it("handles whitespace in merchant name", async () => {
        render(
            <FormWrapper>
                <MerchantFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText("Beliebiger Händler");

        await user.type(input, "   Merchant With Spaces   ");

        expect(input).toHaveValue("   Merchant With Spaces   ");
    });
});
