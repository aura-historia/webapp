import { render, screen } from "@testing-library/react";
import {
    getSwipeDots,
    ProductImageGallery,
} from "@/features/product/detail/components/ProductImageGallery.tsx";
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
    const manyImages = Array.from({ length: 9 }, (_, index) => ({
        url: new URL(`https://example.com/image${index + 1}.jpg`),
        prohibitedContentType: "NONE" as const,
    }));

    it("should render the main product image with descriptive alt text", () => {
        render(<ProductImageGallery images={singleImage} productId="1" title="Vase" />);
        const image = screen.getByAltText("Vase, Bild 1");
        expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
    });

    it("should only offer the open and full screen buttons for a single image", () => {
        render(<ProductImageGallery images={singleImage} productId="1" />);
        expect(screen.getAllByRole("button")).toHaveLength(2);
        expect(screen.queryByTestId("gallery-counter")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Bild 1 anzeigen" })).not.toBeInTheDocument();
    });

    it("should show navigation, a counter and thumbnails for multiple images", () => {
        render(<ProductImageGallery images={multipleImages} productId="1" />);
        expect(screen.getByTestId("gallery-counter")).toHaveTextContent("01 / 03");
        expect(screen.getAllByRole("button", { name: "Bild 3 anzeigen" }).length).toBeGreaterThan(
            0,
        );
    });

    it("should move the counter when a thumbnail is chosen", async () => {
        render(<ProductImageGallery images={multipleImages} productId="1" />);
        await userEvent.click(screen.getAllByRole("button", { name: "Bild 2 anzeigen" })[0]);
        expect(screen.getByTestId("gallery-counter")).toHaveTextContent("02 / 03");
    });

    it("should turn the last grid tile into a show-all button beyond six images", () => {
        render(<ProductImageGallery images={manyImages} productId="1" />);
        expect(
            screen.getByRole("button", { name: "Alle 9 Bilder im Vollbild anzeigen" }),
        ).toHaveTextContent("+4");
    });

    it("should show the translated placeholder without images", () => {
        render(<ProductImageGallery images={[]} productId="1" />);
        expect(screen.getByText("Kein Bild verfügbar")).toBeInTheDocument();
    });

    it("should reset image index when productId changes", async () => {
        const { rerender } = render(<ProductImageGallery images={multipleImages} productId="1" />);
        await userEvent.click(screen.getAllByRole("button", { name: "Bild 2 anzeigen" })[0]);
        rerender(<ProductImageGallery images={multipleImages} productId="2" />);
        expect(screen.getByTestId("gallery-counter")).toHaveTextContent("01 / 03");
    });
    it("should show swipe dots for multiple images only", () => {
        const { rerender } = render(<ProductImageGallery images={singleImage} productId="1" />);
        expect(screen.queryByTestId("gallery-swipe-dots")).not.toBeInTheDocument();
        rerender(<ProductImageGallery images={multipleImages} productId="1" />);
        expect(screen.getByTestId("gallery-swipe-dots").children).toHaveLength(3);
    });

    it("should slide a five-dot window and shrink the edge dots", () => {
        expect(getSwipeDots(3, 0).map((dot) => dot.index)).toEqual([0, 1, 2]);
        const middle = getSwipeDots(9, 4);
        expect(middle.map((dot) => dot.index)).toEqual([2, 3, 4, 5, 6]);
        expect(middle.map((dot) => dot.edge)).toEqual([true, false, false, false, true]);
        expect(getSwipeDots(9, 8).map((dot) => dot.index)).toEqual([4, 5, 6, 7, 8]);
        expect(getSwipeDots(9, 8)[4]).toMatchObject({ active: true, edge: false });
    });
    it("should keep the show-all tile when the sixth image cannot be opened", () => {
        const images = manyImages.map((image, index) =>
            index === 5 ? { ...image, prohibitedContentType: "UNKNOWN" as const } : image,
        );
        render(<ProductImageGallery images={images} productId="1" />);
        expect(
            screen.getByRole("button", { name: "Alle 9 Bilder im Vollbild anzeigen" }),
        ).toBeInTheDocument();
    });

    it("should drop the show-all tile when no image can be opened", () => {
        const images = manyImages.map((image) => ({
            ...image,
            prohibitedContentType: "UNKNOWN" as const,
        }));
        render(<ProductImageGallery images={images} productId="1" />);
        expect(
            screen.queryByRole("button", { name: "Alle 9 Bilder im Vollbild anzeigen" }),
        ).not.toBeInTheDocument();
    });
});
