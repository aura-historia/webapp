import { ProductPriceEstimate } from "@/components/product/detail/ProductPriceEstimate.tsx";
import type { PriceEstimate } from "@/data/internal/quality-indicators/PriceEstimate.ts";
import { render, screen } from "@testing-library/react";

describe("ProductPriceEstimate", () => {
    it("renders nothing when both min and max are undefined", () => {
        const priceEstimate: PriceEstimate = {};

        const { container } = render(
            <ProductPriceEstimate priceEstimate={priceEstimate} shopType={"AUCTION_HOUSE"} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("renders the price range when both min and max are provided", () => {
        const priceEstimate: PriceEstimate = {
            min: "100 €",
            max: "500 €",
        };

        render(<ProductPriceEstimate priceEstimate={priceEstimate} shopType={"AUCTION_HOUSE"} />);

        expect(screen.getByText("100 € - 500 €")).toBeInTheDocument();
    });

    it("renders only the minimum price when max is undefined", () => {
        const priceEstimate: PriceEstimate = {
            min: "100 €",
        };

        render(<ProductPriceEstimate priceEstimate={priceEstimate} shopType={"AUCTION_HOUSE"} />);

        expect(screen.getByText("Mind. 100 €")).toBeInTheDocument();
    });

    it("renders only the maximum price when min is undefined", () => {
        const priceEstimate: PriceEstimate = {
            max: "500 €",
        };

        render(<ProductPriceEstimate priceEstimate={priceEstimate} shopType={"AUCTION_HOUSE"} />);

        expect(screen.getByText("Max. 500 €")).toBeInTheDocument();
    });

    it("applies the correct styling classes", () => {
        const priceEstimate: PriceEstimate = {
            min: "100 €",
            max: "500 €",
        };

        render(<ProductPriceEstimate priceEstimate={priceEstimate} shopType={"AUCTION_HOUSE"} />);

        const container = screen.getByText("100 € - 500 €").parentElement;
        expect(container).toHaveClass("flex", "flex-row", "gap-2");
    });

    it("renders the text with muted foreground styling", () => {
        const priceEstimate: PriceEstimate = {
            min: "100 €",
            max: "500 €",
        };

        render(<ProductPriceEstimate priceEstimate={priceEstimate} shopType={"AUCTION_HOUSE"} />);

        const textElement = screen.getByText("100 € - 500 €");
        expect(textElement).toHaveClass("text-sm", "text-muted-foreground");
    });
});
