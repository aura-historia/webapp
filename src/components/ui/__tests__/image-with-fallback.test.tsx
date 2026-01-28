import { render, screen } from "@testing-library/react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { vi } from "vitest";
import { act } from "react";

// Mock useTranslation
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "product.imageLoadError": "Image could not be loaded",
            };
            return translations[key] || key;
        },
    }),
}));

describe("ImageWithFallback", () => {
    it("should render the image when src is valid", () => {
        render(<ImageWithFallback src="https://example.com/image.jpg" alt="Test image" />);
        const image = screen.getByRole("img", { name: "Test image" });
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    });

    it("should show fallback when src is not provided", () => {
        render(<ImageWithFallback alt="Test image" />);
        const fallback = screen.getByRole("img", { name: "Test image" });
        expect(fallback).toBeInTheDocument();
        expect(screen.getByText("Image could not be loaded")).toBeInTheDocument();
    });

    it("should show fallback when image fails to load", () => {
        render(<ImageWithFallback src="https://example.com/broken.jpg" alt="Test image" />);
        const image = screen.getByRole("img", { name: "Test image" }) as HTMLImageElement;

        // Simulate image load error
        act(() => {
            image.dispatchEvent(new Event("error"));
        });

        expect(screen.getByText("Image could not be loaded")).toBeInTheDocument();
    });

    it("should not show error message when showErrorMessage is false", () => {
        render(<ImageWithFallback alt="Test image" showErrorMessage={false} />);
        expect(screen.queryByText("Image could not be loaded")).not.toBeInTheDocument();
    });

    it("should apply custom className to image", () => {
        render(
            <ImageWithFallback
                src="https://example.com/image.jpg"
                alt="Test image"
                className="custom-class"
            />,
        );
        const image = screen.getByRole("img", { name: "Test image" });
        expect(image).toHaveClass("custom-class");
    });

    it("should apply custom fallbackClassName to fallback", () => {
        render(<ImageWithFallback alt="Test image" fallbackClassName="custom-fallback-class" />);
        const fallback = screen.getByRole("img", { name: "Test image" });
        expect(fallback).toHaveClass("custom-fallback-class");
    });
});
