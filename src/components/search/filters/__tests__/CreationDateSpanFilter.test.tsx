import { CreationDateSpanFilter } from "@/components/search/filters/CreationDateSpanFilter";
import { FormProvider, useForm } from "react-hook-form";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithTranslations } from "@/test/utils.tsx";

// Wrapper component to provide form context for tests
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            creationDate: {
                from: undefined,
                to: undefined,
            },
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("CreationDateSpanFilter", () => {
    it("renderWithTranslationss both date pickers correctly", () => {
        renderWithTranslations(
            <FormWrapper>
                <CreationDateSpanFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Hinzugefügt")).toBeInTheDocument();
        expect(screen.getAllByText("Beliebig")).toHaveLength(2);
    });

    it("opens calendar when from date picker is clicked", async () => {
        renderWithTranslations(
            <FormWrapper>
                <CreationDateSpanFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const datePickers = screen.getAllByText("Beliebig");

        await user.click(datePickers[0]);

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("opens calendar when to date picker is clicked", async () => {
        renderWithTranslations(
            <FormWrapper>
                <CreationDateSpanFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const datePickers = screen.getAllByText("Beliebig");

        await user.click(datePickers[1]);

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("displays selected date in from date picker after selection", async () => {
        renderWithTranslations(
            <FormWrapper>
                <CreationDateSpanFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const datePickers = screen.getAllByText("Beliebig");

        await user.click(datePickers[0]);

        // Find and click a date in the calendar
        const dayButton = screen.getByText("15");
        await user.click(dayButton);

        // Verify "Beliebig" text is no longer shown for the first date picker
        const updatedDatePickers = screen.getAllByText("Beliebig");
        expect(updatedDatePickers).toHaveLength(1);
    });

    it("displays selected date in to date picker after selection", async () => {
        renderWithTranslations(
            <FormWrapper>
                <CreationDateSpanFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const datePickers = screen.getAllByText("Beliebig");

        await user.click(datePickers[1]);

        // Find and click a date in the calendar
        const dayButton = screen.getByText("15");
        await user.click(dayButton);

        // Verify "Beliebig" text is no longer shown for the second date picker
        const updatedDatePickers = screen.getAllByText("Beliebig");
        expect(updatedDatePickers).toHaveLength(1);
    });

    it("hides calendar after date selection", async () => {
        renderWithTranslations(
            <FormWrapper>
                <CreationDateSpanFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        const datePickers = screen.getAllByText("Beliebig");

        await user.click(datePickers[0]);
        const dayButton = screen.getByText("15");
        await user.click(dayButton);

        // Calendar should no longer be in the document
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
