import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShopEditDialog } from "../AdminShopEditDialog.tsx";

const mockMutate = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
    success: vi.fn(),
}));

vi.mock("@/hooks/admin/usePatchAdminShop.ts", () => ({
    usePatchAdminShop: () => ({
        mutate: mockMutate,
        isPending: false,
    }),
}));

vi.mock("@/components/admin/useAdminShopMetadataOptions.ts", () => ({
    useAdminShopMetadataOptions: () => ({
        categoryOptions: [{ value: "furniture", label: "Furniture" }],
        countryOptions: [{ value: "DE", label: "Deutschland" }],
        isCategoriesPending: false,
        isPeriodsPending: false,
        periodOptions: [{ value: "baroque", label: "Barock" }],
    }),
}));

vi.mock("sonner", () => ({
    toast: mockToast,
}));

describe("AdminShopEditDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("submits the current shop values through the form", async () => {
        const user = userEvent.setup();

        render(
            <AdminShopEditDialog
                shop={{
                    shopId: "shop-1",
                    shopSlugId: "aurora-antiques",
                    name: "Aurora Antiques",
                    shopType: "AUCTION_HOUSE",
                    partnerStatus: "PARTNERED",
                    domains: ["aurora.example.com"],
                    url: "https://aurora.example.com",
                    image: "https://example.com/logo.png",
                    phone: "+49 30 123456",
                    email: "contact@aurora.example.com",
                    structuredAddress: {
                        addressline: "Main Street 1",
                        locality: "Berlin",
                        country: "DE",
                    },
                    specialitiesCategories: ["furniture"],
                    specialitiesPeriods: ["baroque"],
                    created: new Date("2024-01-01T00:00:00Z"),
                    updated: new Date("2024-01-02T00:00:00Z"),
                }}
                open
                onOpenChange={vi.fn()}
            />,
        );

        await waitFor(() =>
            expect(screen.getByDisplayValue("https://aurora.example.com")).toBeInTheDocument(),
        );

        await user.click(screen.getByRole("button", { name: "Speichern" }));

        expect(mockMutate).toHaveBeenCalledWith(
            {
                shopId: "shop-1",
                shopType: "AUCTION_HOUSE",
                domains: ["aurora.example.com"],
                url: "https://aurora.example.com",
                image: "https://example.com/logo.png",
                phone: "+49 30 123456",
                email: "contact@aurora.example.com",
                structuredAddress: {
                    addressline: "Main Street 1",
                    locality: "Berlin",
                    country: "DE",
                },
                specialitiesCategories: ["furniture"],
                specialitiesPeriods: ["baroque"],
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            }),
        );
    });
});
