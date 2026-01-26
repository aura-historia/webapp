import { OriginYearFilter } from "@/components/search/filters/OriginYearFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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
            originYearSpan: { min: undefined, max: undefined },
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("OriginYearFilter", () => {
    it("renders with label and input fields", () => {
        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Entstehungsjahr")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Min")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Max")).toBeInTheDocument();
    });

    it("displays default values when provided", () => {
        render(
            <FormWrapper defaultValues={{ originYearSpan: { min: 1900, max: 2000 } }}>
                <OriginYearFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        const maxInput = screen.getByPlaceholderText("Max");

        expect(minInput).toHaveValue("1900");
        expect(maxInput).toHaveValue("2000");
    });

    it("updates min value when input is changed", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        await user.type(minInput, "1850");

        expect(minInput).toHaveValue("1850");
    });

    it("updates max value when input is changed", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        const maxInput = screen.getByPlaceholderText("Max");
        await user.type(maxInput, "1950");

        expect(maxInput).toHaveValue("1950");
    });

    it("ignores non-numeric input", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        await user.type(minInput, "abc");

        expect(minInput).toHaveValue("");
    });

    it("ignores negative numbers (minus sign)", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        await user.type(minInput, "-100");

        expect(minInput).toHaveValue("100");
    });

    it("handles empty initial value correctly", () => {
        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        const maxInput = screen.getByPlaceholderText("Max");

        expect(minInput).toHaveValue("");
        expect(maxInput).toHaveValue("");
    });

    it("renders separator between min and max inputs", () => {
        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("allows entering years in both fields simultaneously", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <OriginYearFilter />
            </FormWrapper>,
        );

        const minInput = screen.getByPlaceholderText("Min");
        const maxInput = screen.getByPlaceholderText("Max");

        await user.type(minInput, "1800");
        await user.type(maxInput, "2020");

        expect(minInput).toHaveValue("1800");
        expect(maxInput).toHaveValue("2020");
    });
});
