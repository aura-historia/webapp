import { ShopDateSpanFilter } from "@/components/search/filters/ShopDateSpanFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expandFilterCard } from "@/test/utils.tsx";
import type React from "react";

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            creationDate: { from: undefined, to: undefined },
            updateDate: { from: undefined, to: undefined },
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ShopDateSpanFilter", () => {
    it("renders the provided title and two date pickers", () => {
        render(
            <FormWrapper>
                <ShopDateSpanFilter
                    field="creationDate"
                    title="Hinzugefügt"
                    resetTooltip="zurücksetzen"
                />
            </FormWrapper>,
        );
        expect(screen.getByText("Hinzugefügt")).toBeInTheDocument();
        expandFilterCard("Hinzugefügt");
        expect(screen.getAllByText("Beliebig")).toHaveLength(2);
    });

    it("opens a calendar when the from-date button is clicked", async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper>
                <ShopDateSpanFilter
                    field="updateDate"
                    title="Aktualisiert"
                    resetTooltip="zurücksetzen"
                />
            </FormWrapper>,
        );
        expandFilterCard("Aktualisiert");
        const datePickers = screen.getAllByText("Beliebig");
        await user.click(datePickers[0]);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});
