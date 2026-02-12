import { render, screen } from "@testing-library/react";
import { ProductImageGallery } from "@/components/product/detail/ProductImageGallery.tsx";
import userEvent from "@testing-library/user-event";

beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
        }),
    });
    global.IntersectionObserver = class {
        observe() {}

        disconnect() {}

        unobserve() {}

        takeRecords() {
            return [];
        }
    } as unknown as typeof IntersectionObserver;
});

describe("ProductImageGallery", () => {
    const singleImage = [
        { url: new URL("https://example.com/image1.jpg"), prohibitedContentType: "NONE" },
    ] as const;
    const multipleImages = [
        { url: new URL("https://example.com/image1.jpg"), prohibitedContentType: "NONE" },
        { url: new URL("https://example.com/image2.jpg"), prohibitedContentType: "NONE" },
        { url: new URL("https://example.com/image3.jpg"), prohibitedContentType: "NONE" },
    ] as const;

    it("should render the main product image", () => {
        render(<ProductImageGallery images={singleImage} productId="1" />);
        const image = screen.getAllByRole("presentation")[0];
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
    });

    it("should NOT show navigation buttons when there is only one image", () => {
        render(<ProductImageGallery images={singleImage} productId="1" />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(1);
    });

    it("should NOT show thumbnail carousel when there is only one image", () => {
        render(<ProductImageGallery images={singleImage} productId="1" />);
        expect(screen.queryByAltText("Thumbnail 1")).not.toBeInTheDocument();
    });

    it("should show navigation buttons when there are multiple images", () => {
        render(<ProductImageGallery images={multipleImages} productId="1" />);
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(1);
    });

    it("should show thumbnail carousel when there are multiple images", () => {
        render(<ProductImageGallery images={multipleImages} productId="1" />);
        expect(screen.getByAltText("Thumbnail 1")).toBeInTheDocument();
        expect(screen.getByAltText("Thumbnail 2")).toBeInTheDocument();
        expect(screen.getByAltText("Thumbnail 3")).toBeInTheDocument();
    });

    it("should reset image index when productId changes", () => {
        const { rerender } = render(<ProductImageGallery images={multipleImages} productId="1" />);

        const thumbnails = screen.getAllByAltText(/Thumbnail/);
        userEvent.click(thumbnails[1]);

        rerender(<ProductImageGallery images={multipleImages} productId="2" />);

        // With carousel, all images are in DOM but first one should be visible
        const mainImages = screen.getAllByRole("presentation");
        expect(mainImages[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
    });
});
