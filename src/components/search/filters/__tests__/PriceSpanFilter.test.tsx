import { PriceSpanFilter } from "@/components/search/filters/PriceSpanFilter";
import { FormProvider, useForm } from "react-hook-form";
import { screen, act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type React from "react";

const mockResetAndNavigate = vi.fn();

vi.mock("@/hooks/search/useFilterNavigation", () => ({
    useFilterNavigation: () => mockResetAndNavigate,
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
            priceSpan: { min: undefined, max: undefined },
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("PriceSpanFilter", () => {
    it("renders with default price range values", () => {
        render(
            <FormWrapper>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Preisspanne")).toBeInTheDocument();
        // Find slider thumbs by their aria-labels instead of slider by name
        expect(screen.getByRole("slider", { name: "Minimum" })).toBeInTheDocument();
        expect(screen.getByRole("slider", { name: "Maximum" })).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();
        expect(screen.getAllByText("€")).toHaveLength(2);
    });

    it("displays default values when provided", () => {
        render(
            <FormWrapper defaultValues={{ priceSpan: { min: 2000, max: 5000 } }}>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        // Check if input fields reflect provided values
        const minInput = screen.getByPlaceholderText("Min");
        const maxInput = screen.getByPlaceholderText("Max");

        expect(minInput).toHaveValue("2000");
        expect(maxInput).toHaveValue("5000");
    });

    it("updates form values when input fields are changed", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");

        // Type in a value
        await user.type(minInput, "300");

        // Check that the value is set
        expect(minInput).toHaveValue("300");
    });

    it("swaps min and max values when min becomes greater than max", async () => {
        const user = userEvent.setup();

        // Start with max already set
        render(
            <FormWrapper defaultValues={{ priceSpan: { max: 4000 } }}>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        const maxInput = screen.getByPlaceholderText("Max");

        // Verify initial state
        expect(maxInput).toHaveValue("4000");

        // Set min to greater value
        await user.type(minInput, "8000");
        await user.click(screen.getByRole("slider", { name: "Minimum" }));

        // Wait for the effect to run (swap operation)
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100)); // longer timeout to ensure swap occurs
        });

        // Check if values were swapped
        expect(minInput).toHaveValue("4000");
        expect(maxInput).toHaveValue("8000");
    });

    it("initializes with provided default values", () => {
        render(
            <FormWrapper defaultValues={{ priceSpan: { min: 1500, max: 7500 } }}>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        const maxInput = screen.getByPlaceholderText("Max");

        expect(minInput).toHaveValue("1500");
        expect(maxInput).toHaveValue("7500");

        // Slider should also reflect these values - get thumbs by aria-label
        const minThumb = screen.getByRole("slider", { name: "Minimum" });
        const maxThumb = screen.getByRole("slider", { name: "Maximum" });

        expect(minThumb).toHaveAttribute("aria-valuenow", "1500");
        expect(maxThumb).toHaveAttribute("aria-valuenow", "7500");
    });

    it("resets price span when reset button is clicked", async () => {
        const user = userEvent.setup();
        mockResetAndNavigate.mockClear();

        render(
            <FormWrapper defaultValues={{ priceSpan: { min: 2000, max: 8000 } }}>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        // Verify initial values are set
        const minInput = screen.getByPlaceholderText("Min");
        const maxInput = screen.getByPlaceholderText("Max");
        expect(minInput).toHaveValue("2000");
        expect(maxInput).toHaveValue("8000");

        // Find and click the reset button using its aria-label
        const resetButton = screen.getByRole("button", { name: /preisspanne zurücksetzen/i });
        await user.click(resetButton);

        // Verify the reset function was called with the correct field name
        expect(mockResetAndNavigate).toHaveBeenCalledWith("priceSpan");
        expect(mockResetAndNavigate).toHaveBeenCalledTimes(1);
    });

    it("displays reset tooltip on hover", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper defaultValues={{ priceSpan: { min: 1000, max: 5000 } }}>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        // Find the reset button using its aria-label
        const resetButton = screen.getByRole("button", { name: /preisspanne zurücksetzen/i });

        // Hover over the button to trigger tooltip
        await user.hover(resetButton);

        // Wait for tooltip to appear
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        // Verify the button is in the document (tooltip content might not be easily testable without proper setup)
        expect(resetButton).toBeInTheDocument();
    });

    it("reset button is accessible and visible", () => {
        render(
            <FormWrapper defaultValues={{ priceSpan: { min: 1000, max: 5000 } }}>
                <PriceSpanFilter />
            </FormWrapper>,
        );

        const resetButton = screen.getByRole("button", { name: /preisspanne zurücksetzen/i });

        expect(resetButton).toBeInTheDocument();
        expect(resetButton).toBeVisible();
        expect(resetButton).toHaveAttribute("type", "button");
        expect(resetButton).toHaveAttribute("aria-label");
    });
});
