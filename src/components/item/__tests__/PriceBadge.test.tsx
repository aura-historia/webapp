import { render, screen } from "@testing-library/react";
import { PriceBadge } from "../PriceBadge";

describe("PriceBadge", () => {
    it("should render PRICE_DISCOVERED correctly", () => {
        render(<PriceBadge eventType="PRICE_DISCOVERED" />);
        expect(screen.getByText("Preis entdeckt")).toBeInTheDocument();
    });

    it("should render PRICE_DROPPED correctly", () => {
        render(<PriceBadge eventType="PRICE_DROPPED" />);
        expect(screen.getByText("Preis gesunken")).toBeInTheDocument();
    });

    it("should render PRICE_INCREASED correctly", () => {
        render(<PriceBadge eventType="PRICE_INCREASED" />);
        expect(screen.getByText("Preis gestiegen")).toBeInTheDocument();
    });

    it("should render PRICE_REMOVED correctly", () => {
        render(<PriceBadge eventType="PRICE_REMOVED" />);
        expect(screen.getByText("Preis entfernt")).toBeInTheDocument();
    });

    it("should apply correct color class for PRICE_DROPPED", () => {
        const { container } = render(<PriceBadge eventType="PRICE_DROPPED" />);
        const badge = container.querySelector(".bg-green-700");
        expect(badge).toBeInTheDocument();
    });

    it("should apply correct color class for PRICE_INCREASED", () => {
        const { container } = render(<PriceBadge eventType="PRICE_INCREASED" />);
        const badge = container.querySelector(".bg-red-700");
        expect(badge).toBeInTheDocument();
    });

    it("should apply correct color class for PRICE_DISCOVERED", () => {
        const { container } = render(<PriceBadge eventType="PRICE_DISCOVERED" />);
        const badge = container.querySelector(".bg-blue-700");
        expect(badge).toBeInTheDocument();
    });

    it("should apply correct color class for PRICE_REMOVED", () => {
        const { container } = render(<PriceBadge eventType="PRICE_REMOVED" />);
        const badge = container.querySelector(".bg-gray-700");
        expect(badge).toBeInTheDocument();
    });

    it("should apply custom className when provided", () => {
        const { container } = render(
            <PriceBadge eventType="PRICE_DROPPED" className="custom-class" />,
        );
        const badge = container.querySelector(".custom-class");
        expect(badge).toBeInTheDocument();
    });

    it("should render icon with correct size", () => {
        const { container } = render(<PriceBadge eventType="PRICE_DROPPED" />);
        const icon = container.querySelector(".w-3.h-3");
        expect(icon).toBeInTheDocument();
    });
});
