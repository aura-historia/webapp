import { ShopTypeFilter } from "@/components/search/filters/ShopTypeFilter";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type React from "react";

vi.mock("@/hooks/search/useFilterNavigation", () => ({
    useFilterNavigation: () => vi.fn(),
}));

const FormWrapper = ({
    children,
    defaultValues = {},
}: {
    children: React.ReactNode;
    defaultValues?: Record<string, unknown>;
}) => {
    const methods = useForm({
        defaultValues: {
            shopType: [],
            ...defaultValues,
        },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("ShopTypeFilter", () => {
    it("renders with correct heading and dropdown trigger", () => {
        render(
            <FormWrapper>
                <ShopTypeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Shop-Typ")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("displays placeholder when no options are selected", () => {
        render(
            <FormWrapper>
                <ShopTypeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Auswählen")).toBeInTheDocument();
    });

    it("displays 'All' when all options are selected", () => {
        render(
            <FormWrapper
                defaultValues={{
                    shopType: [
                        "AUCTION_HOUSE",
                        "AUCTION_PLATFORM",
                        "COMMERCIAL_DEALER",
                        "MARKETPLACE",
                        "UNKNOWN",
                    ],
                }}
            >
                <ShopTypeFilter />
            </FormWrapper>,
        );

        expect(screen.getByText("Alle")).toBeInTheDocument();
    });

    it("displays labels inline when some options are selected", () => {
        render(
            <FormWrapper defaultValues={{ shopType: ["AUCTION_HOUSE", "COMMERCIAL_DEALER"] }}>
                <ShopTypeFilter />
            </FormWrapper>,
        );

        expect(screen.getAllByText(/Auktionshaus/).length).toBeGreaterThan(0);
    });

    it("opens dropdown and shows all options when clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <ShopTypeFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        expect(screen.getByText("Auktionshaus")).toBeInTheDocument();
        expect(screen.getByText("Auktionsplattform")).toBeInTheDocument();
        expect(screen.getByText("Händler")).toBeInTheDocument();
        expect(screen.getByText("Marktplatz")).toBeInTheDocument();
        expect(screen.getByText("Unbekannt")).toBeInTheDocument();
    });

    it("selects an option when clicked in dropdown", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <ShopTypeFilter />
            </FormWrapper>,
        );

        const trigger = screen.getByRole("combobox");
        await user.click(trigger);

        const auctionHouseOption = screen.getByText("Auktionshaus");
        await user.click(auctionHouseOption);

        expect(screen.getAllByText(/Auktionshaus/).length).toBeGreaterThan(0);
    });

    it("selects all options when 'All' is clicked", async () => {
        const user = userEvent.setup();

        render(
            <FormWrapper>
                <ShopTypeFilter />
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
