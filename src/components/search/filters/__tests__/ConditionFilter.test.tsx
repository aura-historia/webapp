import { ConditionFilter } from "@/components/search/filters/ConditionFilter";
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
            condition: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ConditionFilter", () => {
    it("renders with label and dropdown trigger", () => {
        render(
            <FormWrapper>
                <ConditionFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Zustand")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("displays placeholder when no options are selected", () => {
        render(
            <FormWrapper>
                <ConditionFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Auswählen")).toBeInTheDocument();
    });

    it("displays 'All' when all options are selected", () => {
        render(
            <FormWrapper
                defaultValues={{
                    condition: ["EXCELLENT", "GREAT", "GOOD", "FAIR", "POOR", "UNKNOWN"],
                }}
            >
                <ConditionFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("displays labels inline when some options are selected", () => {
        render(
            <FormWrapper defaultValues={{ condition: ["EXCELLENT", "GREAT"] }}>
                <ConditionFilter />
            </FormWrapper>,
        );

        expect(screen.getAllByText(/Exzellent/).length).toBeGreaterThan(0);
    });

    it("opens dropdown and shows all options when clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <ConditionFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        expect(screen.getByText("Exzellent")).toBeInTheDocument();
        expect(screen.getByText("Sehr gut")).toBeInTheDocument();
        expect(screen.getByText("Gut")).toBeInTheDocument();
        expect(screen.getByText("Akzeptabel")).toBeInTheDocument();
        expect(screen.getByText("Schlecht")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
    });

    it("selects an option when clicked in dropdown", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <ConditionFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const excellentOption = screen.getByText("Exzellent");
        await user.click(excellentOption);

        expect(screen.getAllByText(/Exzellent/).length).toBeGreaterThan(0);
    });

    it("selects all options when 'All' is clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <ConditionFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const allOption = screen.getByText("Alle");
        await user.click(allOption);

        expect(screen.getAllByText("Alle")).toHaveLength(2);
    });
});
