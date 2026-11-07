import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makePublicListingSource } from "@/test/fixtures.ts";
import { ShopHeader } from "../ShopHeader.tsx";

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

    it("links the public website in a new tab using nofollow", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);

        // jsdom's name computation drops the leading space inside the sr-only span.
        const link = screen.getByRole("link", {
            name: /^Website besuchen\s*\(öffnet in neuem Tab\)$/,
        });
        expect(link).toHaveAttribute("href", "https://example.com");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "nofollow noopener noreferrer");
    });

    it("omits the website action when no public URL exists", () => {
        render(<ShopHeader shop={makePublicListingSource({ url: undefined })} />);

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
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
