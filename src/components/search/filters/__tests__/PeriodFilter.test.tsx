import { PeriodFilter } from "@/components/search/filters/PeriodFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/search/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

vi.mock("@/client/@tanstack/react-query.gen.ts", () => ({
    getPeriodsOptions: () => ({
        queryKey: ["getPeriods"],
        queryFn: async () => [
            {
                periodId: "renaissance",
                periodKey: "renaissance",
                name: { text: "Renaissance", language: "de" },
            },
            { periodId: "baroque", periodKey: "baroque", name: { text: "Barock", language: "de" } },
            {
                periodId: "art-nouveau",
                periodKey: "art-nouveau",
                name: { text: "Jugendstil", language: "de" },
            },
        ],
    }),
}));

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const methods = useForm({
        defaultValues: {
            periodId: [],
            ...defaultValues,
        },
    });
    return (
        <QueryClientProvider client={queryClient}>
            <FormProvider {...methods}>{children}</FormProvider>
        </QueryClientProvider>
    );
};

describe("PeriodFilter", () => {
    it("renders with correct heading and dropdown trigger", () => {
        render(
            <FormWrapper>
                <PeriodFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Epoche / Stil")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("displays placeholder when no options are selected", () => {
        render(
            <FormWrapper>
                <PeriodFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Auswählen")).toBeInTheDocument();
    });

    it("displays 'All' when all options are selected", async () => {
        render(
            <FormWrapper
                defaultValues={{
                    periodId: ["renaissance", "baroque", "art-nouveau"],
                }}
            >
                <PeriodFilter />
            </FormWrapper>,
        );

        await screen.findByText("Alle");
        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("displays labels inline when some options are selected", async () => {
        render(
            <FormWrapper defaultValues={{ periodId: ["renaissance"] }}>
                <PeriodFilter />
            </FormWrapper>,
        );

        await screen.findAllByText(/Renaissance/);
        expect(screen.getAllByText(/Renaissance/).length).toBeGreaterThan(0);
    });

    it("opens dropdown and shows all period options when clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <PeriodFilter />
            </FormWrapper>,
        );

        await screen.findByRole("combobox");

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        expect(screen.getByText("Renaissance")).toBeInTheDocument();
        expect(screen.getByText("Barock")).toBeInTheDocument();
        expect(screen.getByText("Jugendstil")).toBeInTheDocument();
    });

    it("selects an option when clicked in dropdown", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <PeriodFilter />
            </FormWrapper>,
        );

        await screen.findByRole("combobox");

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const renaissanceOption = screen.getByText("Renaissance");
        await user.click(renaissanceOption);

        expect(screen.getAllByText(/Renaissance/).length).toBeGreaterThan(0);
    });

    it("selects all options when 'All' is clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <PeriodFilter />
            </FormWrapper>,
        );

        await screen.findByRole("combobox");

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const allOption = screen.getByText("Alle");
        await user.click(allOption);

        expect(screen.getAllByText("Alle")).toHaveLength(2);
    });
});
