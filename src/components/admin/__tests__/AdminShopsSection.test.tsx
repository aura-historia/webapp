import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShopsSection } from "../AdminShopsSection.tsx";

const mockUseAdminShops = vi.hoisted(() => vi.fn());
const mockUseInView = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/admin/useAdminShops.ts", () => ({
    useAdminShops: mockUseAdminShops,
}));

vi.mock("react-intersection-observer", () => ({
    useInView: mockUseInView,
}));

vi.mock("../AdminShopCreateDialog.tsx", () => ({
    AdminShopCreateDialog: ({ open }: { open: boolean }) =>
        open ? <div>create-dialog</div> : null,
}));

vi.mock("../AdminShopEditDialog.tsx", () => ({
    AdminShopEditDialog: ({ shop, open }: { shop: { shopId: string } | null; open: boolean }) =>
        open ? <div>edit-dialog:{shop?.shopId}</div> : null,
}));

describe("AdminShopsSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseInView.mockReturnValue({ ref: vi.fn(), inView: false });
        mockUseAdminShops.mockReturnValue({
            data: {
                pages: [
                    {
                        items: [
                            {
                                shopId: "shop-1",
                                shopSlugId: "aurora-antiques",
                                name: "Aurora Antiques",
                                shopType: "AUCTION_HOUSE",
                                partnerStatus: "PARTNERED",
                                image: "https://example.com/logo.png",
                                domains: ["aurora.example.com"],
                                created: new Date("2024-01-01T00:00:00Z"),
                                updated: new Date("2024-01-02T00:00:00Z"),
                            },
                        ],
                        total: 1,
                        searchAfter: undefined,
                    },
                ],
            },
            isPending: false,
            isError: false,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            refetch: vi.fn(),
        });
    });

    it("renders shops and opens the create and edit dialogs", async () => {
        const user = userEvent.setup();

        render(<AdminShopsSection />);

        expect(screen.getByText("Aurora Antiques")).toBeInTheDocument();
        expect(screen.getByText("aurora.example.com")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Shop anlegen/i }));
        expect(screen.getByText("create-dialog")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Aurora Antiques bearbeiten/i }));
        expect(screen.getByText("edit-dialog:shop-1")).toBeInTheDocument();
    });

    it("passes the selected partner filter into the hook", async () => {
        const user = userEvent.setup();

        render(<AdminShopsSection />);

        await user.click(screen.getByRole("button", { name: "Offizieller Partner" }));

        expect(mockUseAdminShops).toHaveBeenLastCalledWith({
            nameQuery: undefined,
            partnerStatus: ["PARTNERED"],
        });
    });
});
