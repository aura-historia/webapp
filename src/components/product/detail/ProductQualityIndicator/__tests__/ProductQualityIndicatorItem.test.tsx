import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductQualityIndicatorItem } from "@/components/product/detail/ProductQualityIndicator/ProductQualityIndicatorItem.tsx";
import { Calendar } from "lucide-react";
import userEvent from "@testing-library/user-event";

describe("ProductQualityIndicatorItem", () => {
    const defaultProps = {
        icon: Calendar,
        colorClass: "bg-green-700",
        label: "Origin Year",
        value: "1850",
    };

    describe("Basic Rendering", () => {
        it("should render label and value correctly", () => {
            render(<ProductQualityIndicatorItem {...defaultProps} />);
            expect(screen.getByText("Origin Year")).toBeInTheDocument();
            expect(screen.getByText("1850")).toBeInTheDocument();
        });

        it("should render icon with correct color class", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const iconContainer = container.querySelector(".bg-green-700");
            expect(iconContainer).toBeInTheDocument();
            expect(iconContainer).toHaveClass("rounded-full", "size-10");
        });

        it("should render icon as white", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const icon = container.querySelector(".text-white");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("size-5");
        });

        it("should render SVG icon", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const svg = container.querySelector("svg");
            expect(svg).toBeInTheDocument();
        });
    });

    describe("Tooltip Functionality", () => {
        it("should NOT render tooltip when description is not provided", () => {
            render(<ProductQualityIndicatorItem {...defaultProps} />);
            const infoIcons = screen.queryAllByRole("button");
            expect(infoIcons.length).toBe(0);
        });

        it("should NOT render Info icon when description is undefined", () => {
            const { container } = render(
                <ProductQualityIndicatorItem {...defaultProps} description={undefined} />,
            );
            const infoIcons = container.querySelectorAll("svg");
            expect(infoIcons.length).toBe(1);
        });

        it("should render Info icon when description is provided", () => {
            render(
                <ProductQualityIndicatorItem {...defaultProps} description="Test description" />,
            );
            const infoIcon = screen.getByRole("button");
            expect(infoIcon).toBeInTheDocument();
        });

        it("should show tooltip with description on hover", async () => {
            const user = userEvent.setup();
            render(
                <ProductQualityIndicatorItem
                    {...defaultProps}
                    description="This is a detailed description"
                />,
            );

            const infoIcon = screen.getByRole("button");
            await user.hover(infoIcon);

            const tooltips = await screen.findAllByText("This is a detailed description");
            expect(tooltips[0]).toBeInTheDocument();
        });
    });

    describe("Different Color Classes", () => {
        it("should apply bg-green-700 color class", () => {
            const { container } = render(
                <ProductQualityIndicatorItem {...defaultProps} colorClass="bg-green-700" />,
            );
            expect(container.querySelector(".bg-green-700")).toBeInTheDocument();
        });

        it("should apply bg-red-700 color class", () => {
            const { container } = render(
                <ProductQualityIndicatorItem {...defaultProps} colorClass="bg-red-700" />,
            );
            expect(container.querySelector(".bg-red-700")).toBeInTheDocument();
            expect(container.querySelector(".bg-green-700")).not.toBeInTheDocument();
        });

        it("should apply bg-sky-600 color class", () => {
            const { container } = render(
                <ProductQualityIndicatorItem {...defaultProps} colorClass="bg-sky-600" />,
            );
            expect(container.querySelector(".bg-sky-600")).toBeInTheDocument();
        });

        it("should apply bg-gray-400 color class", () => {
            const { container } = render(
                <ProductQualityIndicatorItem {...defaultProps} colorClass="bg-gray-400" />,
            );
            expect(container.querySelector(".bg-gray-400")).toBeInTheDocument();
        });
    });

    describe("Text Content", () => {
        it("should render label with correct styling classes", () => {
            render(<ProductQualityIndicatorItem {...defaultProps} />);
            const label = screen.getByText("Origin Year");
            expect(label).toHaveClass("text-base", "font-semibold", "text-muted-foreground");
        });

        it("should render value with correct styling classes", () => {
            render(<ProductQualityIndicatorItem {...defaultProps} />);
            const value = screen.getByText("1850");
            expect(value).toHaveClass("text-lg", "font-bold");
        });

        it("should handle long label text", () => {
            render(
                <ProductQualityIndicatorItem
                    {...defaultProps}
                    label="Very Long Label Text That Might Wrap"
                />,
            );
            expect(screen.getByText("Very Long Label Text That Might Wrap")).toBeInTheDocument();
        });

        it("should handle long value text", () => {
            render(
                <ProductQualityIndicatorItem
                    {...defaultProps}
                    value="Very long value that might overflow"
                />,
            );
            expect(screen.getByText("Very long value that might overflow")).toBeInTheDocument();
        });
    });

    describe("Layout Structure", () => {
        it("should have correct flex layout structure", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const mainContainer = container.firstChild;
            expect(mainContainer).toHaveClass("flex", "items-start", "gap-3");
        });

        it("should have icon container with correct size", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const iconContainer = container.querySelector(".size-10");
            expect(iconContainer).toBeInTheDocument();
            expect(iconContainer).toHaveClass("flex", "items-center", "justify-center");
        });

        it("should have text content in flex column", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const textContainer = container.querySelector(".flex.flex-col");
            expect(textContainer).toBeInTheDocument();
            expect(textContainer).toHaveClass("gap-0.5");
        });
    });

    describe("Description Variations", () => {
        it("should handle empty string description", () => {
            render(<ProductQualityIndicatorItem {...defaultProps} description="" />);
            const infoIcons = screen.queryAllByRole("button");
            expect(infoIcons.length).toBe(0);
        });

        it("should handle very long description text", async () => {
            const user = userEvent.setup();
            const longDescription =
                "This is a very long description that should wrap inside the tooltip and test the max-w-xs class to ensure proper text wrapping behavior in the UI component";
            render(<ProductQualityIndicatorItem {...defaultProps} description={longDescription} />);

            const infoIcon = screen.getByRole("button");
            await user.hover(infoIcon);

            const tooltips = await screen.findAllByText(longDescription);
            expect(tooltips[0]).toBeInTheDocument();
        });

        it("should handle description with special characters", async () => {
            const user = userEvent.setup();
            const specialDescription = "Test with <>&\"' special characters";
            render(
                <ProductQualityIndicatorItem {...defaultProps} description={specialDescription} />,
            );

            const infoIcon = screen.getByRole("button");
            await user.hover(infoIcon);

            const tooltips = await screen.findAllByText(specialDescription);
            expect(tooltips[0]).toBeInTheDocument();
        });
    });

    describe("Multiple Instances", () => {
        it("should render multiple instances independently", () => {
            const { rerender } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            expect(screen.getByText("Origin Year")).toBeInTheDocument();

            rerender(
                <ProductQualityIndicatorItem
                    {...defaultProps}
                    label="Condition"
                    value="Excellent"
                />,
            );
            expect(screen.getByText("Condition")).toBeInTheDocument();
            expect(screen.getByText("Excellent")).toBeInTheDocument();
        });
    });

    describe("Icon Rendering", () => {
        it("should render icon within rounded circle", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const iconContainer = container.querySelector(".rounded-full");
            expect(iconContainer).toBeInTheDocument();
            const icon = iconContainer?.querySelector("svg");
            expect(icon).toBeInTheDocument();
        });

        it("should render icon with size-5 class", () => {
            const { container } = render(<ProductQualityIndicatorItem {...defaultProps} />);
            const icon = container.querySelector(".size-5");
            expect(icon).toBeInTheDocument();
        });
    });
});
