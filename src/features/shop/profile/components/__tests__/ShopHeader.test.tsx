import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { ShopHeader } from "../ShopHeader.tsx";

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        to,
        search,
        children,
        className,
    }: {
        to: string;
        search: Record<string, string | boolean>;
        children: ReactNode;
        className?: string;
    }) => (
        <a
            href={`${to.replace("$lng", "de")}?${new URLSearchParams(
                Object.entries(search).map(([key, value]) => [key, String(value)]),
            ).toString()}`}
            className={className}
        >
            {children}
        </a>
    ),
}));

const WEBSITE_LINK = /^Website besuchen/;

describe("ShopHeader", () => {
    it("renders the eyebrow, provider name, operator and buying note", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);

        expect(screen.getByText("Anbieter")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 1, name: "Antique Store" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Betreiber: Antique Operator")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Aura Historia erfasst die öffentlichen Angebote dieses Anbieters. Sie kaufen direkt beim Anbieter.",
            ),
        ).toBeInTheDocument();
    });

    it("no longer renders a separate profile heading", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);

        expect(screen.getAllByRole("heading")).toHaveLength(1);
    });

    it("links the source's viewUrl in a new tab using nofollow", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);

        // jsdom's name computation drops the leading space inside the sr-only span.
        const link = screen.getByRole("link", {
            name: /^Website besuchen\s*\(öffnet in neuem Tab\)$/,
        });
        expect(link).toHaveAttribute(
            "href",
            "https://example.com/?utm_source=aura_historia&utm_medium=referral",
        );
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "nofollow noopener noreferrer");
    });

    it("sends visitors to an affiliate viewUrl instead of the raw url", () => {
        const viewUrl =
            "https://prf.hn/click/camref:1100lAbCd/destination:https%3A%2F%2Fexample.com";
        render(<ShopHeader shop={makePublicListingSource({ viewUrl })} />);

        expect(screen.getByRole("link", { name: WEBSITE_LINK })).toHaveAttribute("href", viewUrl);
    });

    it("falls back to the raw url when the response has no viewUrl", () => {
        render(<ShopHeader shop={makePublicListingSource({ viewUrl: undefined })} />);

        expect(screen.getByRole("link", { name: WEBSITE_LINK })).toHaveAttribute(
            "href",
            "https://example.com",
        );
    });

    it("omits the website action when no public URL exists", () => {
        render(
            <ShopHeader shop={makePublicListingSource({ url: undefined, viewUrl: undefined })} />,
        );

        expect(screen.queryByRole("link", { name: WEBSITE_LINK })).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Als Partner bewerben" })).toBeInTheDocument();
    });

    it("links operators to a new application with this provider chosen", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);

        expect(screen.getByText(/^Ist das Ihr Shop\?/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Als Partner bewerben" })).toHaveAttribute(
            "href",
            `/de/partners/applications?create=true&provider=${makePublicListingSource().slugId}`,
        );
    });

    it("shows the provider's initial without an image", () => {
        const { container } = render(
            <ShopHeader shop={makePublicListingSource({ name: "  ébéniste Paris" })} />,
        );

        const initial = screen.getByTestId("shop-header-initial");
        expect(initial).toHaveTextContent(/^É$/);
        expect(initial).toHaveAttribute("aria-hidden", "true");
        expect(container.querySelector("img")).not.toBeInTheDocument();
    });

    it("renders the public image as decoration instead of the initial", () => {
        const { container } = render(
            <ShopHeader
                shop={makePublicListingSource({ image: "https://example.com/source.jpg" })}
            />,
        );

        const image = container.querySelector("img");
        expect(image).toHaveAttribute("src", "https://example.com/source.jpg");
        expect(image).toHaveAttribute("alt", "");
        expect(screen.queryByTestId("shop-header-initial")).not.toBeInTheDocument();
    });
});
