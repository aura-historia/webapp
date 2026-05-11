import { ShopCard } from "@/components/shop/ShopCard.tsx";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import type React from "react";

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        Link: ({
            children,
            to,
            params,
            ...props
        }: {
            children: React.ReactNode;
            to?: string;
            params?: Record<string, string>;
            className?: string;
        }) => {
            const slugId = params?.shopSlugId;
            const href = slugId ? (to ?? "").replace("$shopSlugId", slugId) : to;
            return (
                <a href={href} {...props}>
                    {children}
                </a>
            );
        },
    };
});

const buildShop = (overrides: Partial<ShopDetail> = {}): ShopDetail => ({
    shopId: "shop-1",
    shopSlugId: "example-shop",
    name: "Example Shop",
    shopType: "AUCTION_HOUSE",
    partnerStatus: "PARTNERED",
    image: undefined,
    domains: ["example.com"],
    created: new Date("2024-01-15T00:00:00.000Z"),
    updated: new Date("2024-06-15T00:00:00.000Z"),
    ...overrides,
});

describe("ShopCard", () => {
    it("renders shop name and badges", async () => {
        await act(async () => {
            renderWithRouter(<ShopCard shop={buildShop()} />);
        });

        expect(screen.getByText("Example Shop")).toBeInTheDocument();
        // shop type badge + partner status badge
        expect(screen.getByText("Auktionshaus")).toBeInTheDocument();
        expect(screen.getByText("Offizieller Partner")).toBeInTheDocument();
    });

    it("renders a placeholder icon when no image is provided", async () => {
        await act(async () => {
            renderWithRouter(<ShopCard shop={buildShop({ image: undefined })} />);
        });
        expect(screen.getByLabelText("Kein Logo verfügbar")).toBeInTheDocument();
    });

    it("renders the shop image when provided", async () => {
        await act(async () => {
            renderWithRouter(
                <ShopCard shop={buildShop({ image: "https://cdn.example.com/shop.png" })} />,
            );
        });
        const image = screen.getByAltText("Logo von Example Shop") as HTMLImageElement;
        expect(image).toBeInTheDocument();
        expect(image.src).toBe("https://cdn.example.com/shop.png");
    });

    it("renders a link to the shop detail page", async () => {
        await act(async () => {
            renderWithRouter(<ShopCard shop={buildShop()} />);
        });
        const links = screen.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
        // At least one link points to the shop detail route
        expect(links.some((link) => link.getAttribute("href")?.includes("example-shop"))).toBe(
            true,
        );
    });
});
