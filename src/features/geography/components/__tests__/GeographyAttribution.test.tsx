import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GeographyAttribution } from "@/features/geography/components/GeographyAttribution.tsx";

describe("GeographyAttribution", () => {
    it("links the Amazon Location Service attribution page by default", () => {
        render(<GeographyAttribution />);

        const link = screen.getByRole("link", { name: "Amazon Location Service" });
        expect(link).toHaveAttribute(
            "href",
            "https://docs.aws.amazon.com/location/latest/developerguide/data-attribution.html",
        );
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        expect(link.closest("p")).toHaveTextContent("Standortdaten: Amazon Location Service");
    });

    it("uses the provider name and URL supplied by the contract", () => {
        render(
            <GeographyAttribution
                attribution={{ provider: "Example Provider", url: "https://example.test/notices" }}
            />,
        );

        expect(screen.getByRole("link", { name: "Example Provider" })).toHaveAttribute(
            "href",
            "https://example.test/notices",
        );
    });
});
