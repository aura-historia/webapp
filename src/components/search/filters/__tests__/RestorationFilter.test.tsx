import { RestorationFilter } from "@/components/search/filters/RestorationFilter";
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
            restoration: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("RestorationFilter", () => {
    it("renders with label and dropdown trigger", () => {
        render(
            <FormWrapper>
                <RestorationFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Restaurierung")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("displays placeholder when no options are selected", () => {
        render(
            <FormWrapper>
                <RestorationFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Auswählen")).toBeInTheDocument();
    });

    it("displays 'All' when all options are selected", () => {
        render(
            <FormWrapper
                defaultValues={{
                    restoration: ["NONE", "MINOR", "MAJOR", "UNKNOWN"],
                }}
            >
                <RestorationFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("displays selected count when some options are selected", () => {
        render(
            <FormWrapper defaultValues={{ restoration: ["NONE", "MINOR"] }}>
                <RestorationFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("2 ausgewählt")).toBeInTheDocument();
    });

    it("shows badges for selected options when not all selected", () => {
        render(
            <FormWrapper defaultValues={{ restoration: ["NONE", "MINOR"] }}>
                <RestorationFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Keine")).toBeInTheDocument();
        expect(screen.getByText("Geringfügig")).toBeInTheDocument();
    });

    it("opens dropdown and shows all options when clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <RestorationFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        expect(screen.getByText("Keine")).toBeInTheDocument();
        expect(screen.getByText("Geringfügig")).toBeInTheDocument();
        expect(screen.getByText("Umfangreich")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
    });

    it("selects an option when clicked in dropdown", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <RestorationFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const noneOption = screen.getByText("Keine");
        await user.click(noneOption);

        expect(screen.getByText("1 ausgewählt")).toBeInTheDocument();
    });

    it("selects all options when 'All' is clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <RestorationFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const allOption = screen.getByText("Alle");
        await user.click(allOption);

        expect(screen.getAllByText("Alle")).toHaveLength(2);
    });

    it("removes option when badge X is clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper defaultValues={{ restoration: ["NONE", "MINOR"] }}>
                <RestorationFilter />
            </FormWrapper>,
        );

        const removeButtons = screen.getAllByRole("button");
        await user.click(removeButtons[0]);

        expect(screen.getByText("1 ausgewählt")).toBeInTheDocument();
    });
});
