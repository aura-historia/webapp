import { AuctionDateSpanFilter } from "@/features/search/products/components/filters/AuctionDateSpanFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expandFilterCard } from "@/test/utils.tsx";

vi.mock("@/features/search/products/hooks/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

// Wrapper component to provide form context for tests
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
        defaultValues: {
            auctionDate: {
                from: undefined,
                to: undefined,
            },
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("AuctionDateSpanFilter", () => {
    it("renders both date pickers correctly", () => {
        render(
            <FormWrapper>
                <AuctionDateSpanFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Auktionsdatum")).toBeInTheDocument();
        expandFilterCard("Auktionsdatum");
        expect(screen.getAllByText("Beliebig")).toHaveLength(2);
    });

    it("allows date selection", () => {
        render(
            <FormWrapper>
                <AuctionDateSpanFilter />
            </FormWrapper>,
        );

        expandFilterCard("Auktionsdatum");
        const datePickers = screen.getAllByText("Beliebig");

        for (const picker of datePickers) {
            expect(picker.closest("button")).not.toBeDisabled();
        }
    });

    it("has visual indication when the subscription disables it", () => {
        const { container } = render(
            <FormWrapper>
                <AuctionDateSpanFilter disabled />
            </FormWrapper>,
        );

        // Check that the card has opacity-50 class when disabled
        const card = container.querySelector('[class*="opacity-50"]');
        expect(card).toBeInTheDocument();
    });

    it("opens calendar when from date picker is clicked and filter is enabled", async () => {
        render(
            <FormWrapper>
                <AuctionDateSpanFilter />
            </FormWrapper>,
        );

        const user = userEvent.setup();
        expandFilterCard("Auktionsdatum");
        const datePickers = screen.getAllByText("Beliebig");

        await user.click(datePickers[0]);

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});
