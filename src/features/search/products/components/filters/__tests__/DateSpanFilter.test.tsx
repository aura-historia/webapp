import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import {
    AuctionDateSpanFilter,
    CreationDateSpanFilter,
    UpdateDateSpanFilter,
} from "@/features/search/products/components/filters/DateSpanFilter.tsx";
import { expandFilterCard } from "@/test/utils.tsx";

vi.mock("@/features/search/products/hooks/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

const EMPTY_RANGE = { from: undefined, to: undefined };

function FormWrapper({
    children,
    values = {},
}: {
    readonly children: React.ReactNode;
    readonly values?: Record<string, { from?: Date; to?: Date }>;
}) {
    const methods = useForm({
        defaultValues: {
            auctionDate: EMPTY_RANGE,
            creationDate: EMPTY_RANGE,
            updateDate: EMPTY_RANGE,
            ...values,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
}

describe.each([
    ["AuctionDateSpanFilter", AuctionDateSpanFilter, "Auktionsdatum"],
    ["CreationDateSpanFilter", CreationDateSpanFilter, "Hinzugefügt"],
    ["UpdateDateSpanFilter", UpdateDateSpanFilter, "Aktualisiert"],
] as const)("%s", (_name, Filter, title) => {
    it("renders a From and a To date field", () => {
        render(
            <FormWrapper>
                <Filter />
            </FormWrapper>,
        );

        expandFilterCard(title);
        expect(screen.getByText("Von")).toBeInTheDocument();
        expect(screen.getByText("Bis")).toBeInTheDocument();
        expect(screen.getAllByText("Beliebig")).toHaveLength(2);
    });

    it("opens the calendar and closes it once a day is picked", async () => {
        const user = userEvent.setup();
        render(
            <FormWrapper>
                <Filter />
            </FormWrapper>,
        );

        expandFilterCard(title);
        await user.click(screen.getByRole("button", { name: `${title} von` }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();

        await user.click(screen.getByText("15"));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getAllByText("Beliebig")).toHaveLength(1);
    });

    it("summarises a set range in the heading and clears it", async () => {
        const user = userEvent.setup();
        const field = {
            Auktionsdatum: "auctionDate",
            Hinzugefügt: "creationDate",
            Aktualisiert: "updateDate",
        }[title];
        render(
            <FormWrapper values={{ [field]: { from: new Date(2026, 10, 14) } }}>
                <Filter defaultOpen />
            </FormWrapper>,
        );

        expect(screen.getAllByText(/14\. Nov\. 2026/).length).toBeGreaterThan(0);

        await user.click(screen.getByRole("button", { name: `${title} von löschen` }));

        expect(screen.getAllByText("Beliebig")).toHaveLength(2);
    });

    it("locks the group when the subscription does not include it", () => {
        render(
            <FormWrapper>
                <Filter disabled />
            </FormWrapper>,
        );

        expect(screen.getByRole("button", { name: title })).toBeDisabled();
    });
});

describe("DateSpanFilter validation", () => {
    it("marks the To field and shows the date-order error", () => {
        function Invalid() {
            const methods = useForm({
                defaultValues: {
                    auctionDate: { from: new Date(2026, 10, 14), to: new Date(2026, 10, 2) },
                },
                errors: {
                    auctionDate: {
                        to: { type: "custom", message: "Startdatum muss vor dem Enddatum liegen" },
                    },
                },
            });
            return (
                <FormProvider {...methods}>
                    <AuctionDateSpanFilter defaultOpen />
                </FormProvider>
            );
        }

        render(<Invalid />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Startdatum muss vor dem Enddatum liegen",
        );
        expect(screen.getByRole("button", { name: /^Auktionsdatum bis:/ })).toHaveAttribute(
            "aria-invalid",
            "true",
        );
    });
});
