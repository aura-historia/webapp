import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerShopsSection } from "../PartnerShopsSection.tsx";

const mockUseMyPartnerShops = vi.hoisted(() => vi.fn());

vi.mock("@/features/partner/shop-management/api/useMyPartnerShops.ts", () => ({
    useMyPartnerShops: mockUseMyPartnerShops,
}));

vi.mock("../PartnerShopEditDialog.tsx", () => ({
    PartnerShopEditDialog: ({
        shop,
        open,
        onOpenChange,
    }: {
        shop: { shopId: string } | null;
        open: boolean;
        onOpenChange: (open: boolean) => void;
    }) =>
        open ? (
            <div>
                edit-dialog:{shop?.shopId}
                <button type="button" onClick={() => onOpenChange(false)}>
                    close-edit-dialog
                </button>
            </div>
        ) : null,
}));

const baseShop = {
    shopId: "shop-1",
    shopSlugId: "aurora-antiques",
    name: "Aurora Antiques",
    shopType: "AUCTION_HOUSE" as const,
    partnerStatus: "PARTNERED" as const,
    image: "https://example.com/logo.png",
    domains: ["aurora.example.com"],
    url: "https://aurora.example.com",
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
};

describe("PartnerShopsSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the loading skeleton while pending", () => {
        mockUseMyPartnerShops.mockReturnValue({
            data: undefined,
            isPending: true,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerShopsSection />);

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renders an error state with retry", async () => {
        const refetch = vi.fn();
        mockUseMyPartnerShops.mockReturnValue({
            data: undefined,
            isPending: false,
            isError: true,
            refetch,
        });
        const user = userEvent.setup();

        render(<PartnerShopsSection />);

        await user.click(screen.getByRole("button", { name: /erneut versuchen/i }));
        expect(refetch).toHaveBeenCalled();
    });

    it("renders an empty state when there are no shops", () => {
        mockUseMyPartnerShops.mockReturnValue({
            data: [],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerShopsSection />);

        expect(
            screen.getByText("Es sind noch keine Shops mit Ihrem Partnerkonto verknüpft."),
        ).toBeInTheDocument();
    });

    it("renders shops and opens the edit dialog", async () => {
        mockUseMyPartnerShops.mockReturnValue({
            data: [baseShop],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });
        const user = userEvent.setup();

        render(<PartnerShopsSection />);

        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
        expect(screen.getByText("aurora.example.com")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Aurora Antiques bearbeiten/i }));
        expect(screen.getByText("edit-dialog:shop-1")).toBeInTheDocument();

        await user.click(screen.getByText("close-edit-dialog"));
        expect(screen.queryByText("edit-dialog:shop-1")).not.toBeInTheDocument();
    });

    it("renders a shop without domains, contact info, or address", () => {
        mockUseMyPartnerShops.mockReturnValue({
            data: [
                {
                    shopId: "shop-2",
                    shopSlugId: "minimal-shop",
                    name: "Minimal Shop",
                    partnerStatus: "PARTNERED" as const,
                    domains: [],
                    created: new Date("2024-01-01T00:00:00Z"),
                    updated: new Date("2024-01-02T00:00:00Z"),
                },
            ],
            isPending: false,
            isError: false,
            refetch: vi.fn(),
        });

        render(<PartnerShopsSection />);

        expect(screen.getByText("Minimal Shop")).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
});
