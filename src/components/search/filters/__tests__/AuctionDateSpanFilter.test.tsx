import { AuctionDateSpanFilter } from "@/components/search/filters/AuctionDateSpanFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ShopType } from "@/data/internal/shop/ShopType.ts";
import { expandFilterCard } from "@/test/utils.tsx";

vi.mock("@/hooks/search/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

// Wrapper component to provide form context for tests
const FormWrapper = ({
    children,
    shopType = [],
}: {
    children: React.ReactNode;
    shopType?: ShopType[];
}) => {
    const methods = useForm({
        defaultValues: {
            auctionDate: {
                from: undefined,
                to: undefined,
            },
            shopType,
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

    it("is enabled when no shop type is selected", () => {
        render(
            <FormWrapper shopType={[]}>
                <AuctionDateSpanFilter />
            </FormWrapper>,
        );

        expandFilterCard("Auktionsdatum");
        const datePickers = screen.getAllByText("Beliebig");

        for (const picker of datePickers) {
            expect(picker.closest("button")).not.toBeDisabled();
        }
    });

    it("is enabled when AUCTION_HOUSE is selected", () => {
        render(
            <FormWrapper shopType={["AUCTION_HOUSE"]}>
                <AuctionDateSpanFilter />
            </FormWrapper>,
        );

        expandFilterCard("Auktionsdatum");
        const datePickers = screen.getAllByText("Beliebig");

        for (const picker of datePickers) {
            expect(picker.closest("button")).not.toBeDisabled();
        }
    });

    it("has visual indication when disabled", () => {
        const { container } = render(
            <FormWrapper shopType={["COMMERCIAL_DEALER"]}>
                <AuctionDateSpanFilter />
            </FormWrapper>,
        );

        // Check that the card has opacity-50 class when disabled
        const card = container.querySelector('[class*="opacity-50"]');
        expect(card).toBeInTheDocument();
    });

    it("opens calendar when from date picker is clicked and filter is enabled", async () => {
        render(
            <FormWrapper shopType={["AUCTION_HOUSE"]}>
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
