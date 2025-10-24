import { render, screen } from "@testing-library/react";
import { ItemImageGallery } from "@/components/item/ItemImageGallery";
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

describe("ItemImageGallery", () => {
    const singleImage = [new URL("https://example.com/image1.jpg")];
    const multipleImages = [
        new URL("https://example.com/image1.jpg"),
        new URL("https://example.com/image2.jpg"),
        new URL("https://example.com/image3.jpg"),
    ];

    it("should render the main product image", () => {
        render(<ItemImageGallery images={singleImage} title="Test Product" itemId="1" />);
        const image = screen.getByAltText("Produktbild von Test Product");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
    });

    it("should NOT show navigation buttons when there is only one image", () => {
        render(<ItemImageGallery images={singleImage} title="Test Product" itemId="1" />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(1);
    });

    it("should NOT show thumbnail carousel when there is only one image", () => {
        render(<ItemImageGallery images={singleImage} title="Test Product" itemId="1" />);
        expect(screen.queryByAltText("Thumbnail 1")).not.toBeInTheDocument();
    });

    it("should show navigation buttons when there are multiple images", () => {
        render(<ItemImageGallery images={multipleImages} title="Test Product" itemId="1" />);
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(1);
    });

    it("should show thumbnail carousel when there are multiple images", () => {
        render(<ItemImageGallery images={multipleImages} title="Test Product" itemId="1" />);
        expect(screen.getByAltText("Thumbnail 1")).toBeInTheDocument();
        expect(screen.getByAltText("Thumbnail 2")).toBeInTheDocument();
        expect(screen.getByAltText("Thumbnail 3")).toBeInTheDocument();
    });

    it("should reset image index when itemId changes", () => {
        const { rerender } = render(
            <ItemImageGallery images={multipleImages} title="Test Product" itemId="1" />,
        );

        const thumbnails = screen.getAllByAltText(/Thumbnail/);
        userEvent.click(thumbnails[1]);

        rerender(<ItemImageGallery images={multipleImages} title="Test Product" itemId="2" />);

        const mainImage = screen.getByAltText("Produktbild von Test Product");
        expect(mainImage).toHaveAttribute("src", "https://example.com/image1.jpg");
    });
});
