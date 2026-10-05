import { ShopCard } from "@/features/shop/profile/components/ShopCard.tsx";
import { makePublicListingSource } from "@/test/fixtures.ts";
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
            params?:
                | Record<string, string>
                | ((current: Record<string, string>) => Record<string, string>);
            className?: string;
        }) => {
            const resolvedParams =
                typeof params === "function" ? params({ lng: "de" }) : (params ?? { lng: "de" });
            let href = to ?? "";
            for (const [key, value] of Object.entries(resolvedParams)) {
                href = href.replace(`$${key}`, value);
            }
            return (
                <a href={href} {...props}>
                    {children}
                </a>
            );
        },
    };
});

describe("ShopCard", () => {
    it("renders the source and public operator", async () => {
        await act(async () => renderWithRouter(<ShopCard shop={makePublicListingSource()} />));
        expect(screen.getByText("Antique Store")).toBeInTheDocument();
        expect(screen.getByText(/Antique Operator/)).toBeInTheDocument();
    });
    it("links the title and action to the immutable source slug", async () => {
        await act(async () => renderWithRouter(<ShopCard shop={makePublicListingSource()} />));
        for (const link of screen.getAllByRole("link"))
            expect(link).toHaveAttribute("href", "/de/shops/antique-store");
    });
    it("renders a public image when provided", async () => {
        await act(async () =>
            renderWithRouter(
                <ShopCard
                    shop={makePublicListingSource({ image: "https://example.com/source.jpg" })}
                />,
            ),
        );
        expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/source.jpg");
    });
    it("renders a placeholder when no image is present", async () => {
        await act(async () => renderWithRouter(<ShopCard shop={makePublicListingSource()} />));
        expect(screen.getByRole("img")).not.toHaveAttribute("src");
    });
});
