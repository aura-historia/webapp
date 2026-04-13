import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { ProductQualityIndicatorItem } from "@/components/product/detail/quality-indicator/ProductQualityIndicatorItem.tsx";

describe("ProductQualityIndicatorItem", () => {
    const defaultProps = {
        colorClass: "bg-green-700",
        label: "Origin Year",
        value: "1850",
    };

    it("should render label and value correctly", () => {
        render(<ProductQualityIndicatorItem {...defaultProps} />);
        expect(screen.getByText("Origin Year")).toBeInTheDocument();
        expect(screen.getByText("1850")).toBeInTheDocument();
    });

    it("should render the color dot with the provided color class", () => {
        const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
        const dot = container.querySelector(".bg-green-700");
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveClass("size-2", "rounded-full");
    });

    it("should use dossier grid layout", () => {
        const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
        const root = container.firstChild as HTMLElement;
        expect(root).toHaveClass("grid", "grid-cols-[minmax(0,10rem)_minmax(0,1fr)]");
    });

    it("should not render tooltip trigger without description", () => {
        render(<ProductQualityIndicatorItem {...defaultProps} />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should render tooltip trigger when description exists", () => {
        render(<ProductQualityIndicatorItem {...defaultProps} description="Condition details" />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should show tooltip on hover", async () => {
        const user = userEvent.setup();
        render(
            <ProductQualityIndicatorItem
                {...defaultProps}
                description="Detailed description text"
            />,
        );
        await user.hover(screen.getByRole("button"));
        const tooltips = await screen.findAllByText("Detailed description text");
        expect(tooltips[0]).toBeInTheDocument();
    });
});
