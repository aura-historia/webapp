import { AuthenticityFilter } from "@/components/search/filters/AuthenticityFilter";
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
            authenticity: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("AuthenticityFilter", () => {
    it("renders with label and dropdown trigger", () => {
        render(
            <FormWrapper>
                <AuthenticityFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Authentizität")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("displays placeholder when no options are selected", () => {
        render(
            <FormWrapper>
                <AuthenticityFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Auswählen")).toBeInTheDocument();
    });

    it("displays 'All' when all options are selected", () => {
        render(
            <FormWrapper
                defaultValues={{
                    authenticity: [
                        "ORIGINAL",
                        "LATER_COPY",
                        "REPRODUCTION",
                        "QUESTIONABLE",
                        "UNKNOWN",
                    ],
                }}
            >
                <AuthenticityFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("displays labels inline when some options are selected", () => {
        render(
            <FormWrapper defaultValues={{ authenticity: ["ORIGINAL", "LATER_COPY"] }}>
                <AuthenticityFilter />
            </FormWrapper>,
        );

        expect(screen.getAllByText(/Original/).length).toBeGreaterThan(0);
    });

    it("opens dropdown and shows all options when clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <AuthenticityFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        expect(screen.getByText("Original")).toBeInTheDocument();
        expect(screen.getByText("Spätere Kopie")).toBeInTheDocument();
        expect(screen.getByText("Reproduktion")).toBeInTheDocument();
        expect(screen.getByText("Fraglich")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
    });

    it("selects an option when clicked in dropdown", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <AuthenticityFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const originalOption = screen.getByText("Original");
        await user.click(originalOption);

        expect(screen.getAllByText(/Original/).length).toBeGreaterThan(0);
    });

    it("selects all options when 'All' is clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <AuthenticityFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const allOption = screen.getByText("Alle");
        await user.click(allOption);

        // Should show "Alle" in trigger
        expect(screen.getAllByText("Alle")).toHaveLength(2); // One in trigger, one in dropdown
    });
});
