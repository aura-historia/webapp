import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShopHeader } from "../ShopHeader.tsx";
import { makePublicListingSource } from "@/test/fixtures.ts";

describe("ShopHeader", () => {
    it("renders the public source name and operator", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);
        expect(screen.getByRole("heading", { name: "Antique Store" })).toBeInTheDocument();
        expect(screen.getByText(/Antique Operator/)).toBeInTheDocument();
    });
    it("links the public website using nofollow", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "https://example.com");
        expect(link).toHaveAttribute("rel", "nofollow noopener noreferrer");
    });
    it("omits the website action when no public URL exists", () => {
        render(<ShopHeader shop={makePublicListingSource({ url: undefined })} />);
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
    it("uses a placeholder without an image", () => {
        render(<ShopHeader shop={makePublicListingSource()} />);
        expect(screen.getByRole("img")).not.toHaveAttribute("src");
    });
    it("renders a public image", () => {
        render(
            <ShopHeader
                shop={makePublicListingSource({ image: "https://example.com/source.jpg" })}
            />,
        );
        expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/source.jpg");
    });
});
