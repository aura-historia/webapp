import { act, screen } from "@testing-library/react";
import { ProductCardImageCarousel } from "../ProductCardImageCarousel.tsx";
import { renderWithRouter } from "@/test/utils.tsx";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import type { ReactNode } from "react";
import type { CarouselApi } from "@/components/ui/carousel.tsx";

// Mock the Carousel component to avoid issues in test environment
vi.mock("@/components/ui/carousel.tsx", () => {
    const mockApi: CarouselApi = {
        on: vi.fn(),
        off: vi.fn(),
        scrollTo: vi.fn(),
        selectedScrollSnap: () => 0,
        canScrollPrev: () => false,
        canScrollNext: () => true,
        scrollPrev: vi.fn(),
        scrollNext: vi.fn(),
        reInit: vi.fn(),
        destroy: vi.fn(),
        scrollSnapList: () => [0],
        scrollProgress: () => 0,
        slidesInView: () => [0],
        slidesNotInView: () => [],
        containerNode: () => null,
        slideNodes: () => [],
        internalEngine: () => ({}) as any,
        plugins: () => ({}) as any,
        rootNode: () => null,
    };

    return {
        Carousel: ({
            children,
            setApi,
        }: {
            children: ReactNode;
            setApi?: (api: CarouselApi) => void;
        }) => {
            // Call setApi with the mock API when component mounts
            if (setApi) {
                setTimeout(() => setApi(mockApi), 0);
            }
            return <div>{children}</div>;
        },
        CarouselContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        CarouselItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        CarouselPrevious: () => <button type="button">Previous</button>,
        CarouselNext: () => <button type="button">Next</button>,
    };
});

describe("ProductCardImageCarousel", () => {
    const mockImages: ProductImage[] = [
        { url: new URL("https://example.com/image1.jpg"), prohibitedContentType: "NONE" },
        { url: new URL("https://example.com/image2.jpg"), prohibitedContentType: "NONE" },
        { url: new URL("https://example.com/image3.jpg"), prohibitedContentType: "NONE" },
    ];

    const defaultProps = {
        shopId: "shop-1",
        shopsProductId: "product-1",
    };

    it("should render a placeholder when no images are provided", async () => {
        await act(() => {
            renderWithRouter(<ProductCardImageCarousel images={[]} {...defaultProps} />);
        });
        expect(screen.getByTestId("placeholder-image")).toBeInTheDocument();
    });

    it("should render a single image without carousel when only one image is provided", async () => {
        const singleImage = [mockImages[0]];
        await act(() => {
            renderWithRouter(<ProductCardImageCarousel images={singleImage} {...defaultProps} />);
        });
        const image = screen.getByRole("presentation");
        expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
    });

    it("should render the first image by default in carousel mode", async () => {
        await act(() => {
            renderWithRouter(<ProductCardImageCarousel images={mockImages} {...defaultProps} />);
        });
        const images = screen.getAllByRole("presentation");
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
    });

    it("should render dot indicators when multiple images are provided", async () => {
        await act(() => {
            renderWithRouter(<ProductCardImageCarousel images={mockImages} {...defaultProps} />);
        });
        const dots = screen.getAllByLabelText(/Go to image/);
        expect(dots).toHaveLength(3);
    });

    it("should not render dot indicators when only one image is provided", async () => {
        const singleImage = [mockImages[0]];
        await act(() => {
            renderWithRouter(<ProductCardImageCarousel images={singleImage} {...defaultProps} />);
        });
        const dots = screen.queryAllByLabelText(/Go to image/);
        expect(dots).toHaveLength(0);
    });

    it("should render all images in the carousel", async () => {
        await act(() => {
            renderWithRouter(<ProductCardImageCarousel images={mockImages} {...defaultProps} />);
        });
        const images = screen.getAllByRole("presentation");
        expect(images).toHaveLength(3);
    });

    it("should have proper link to product detail page", async () => {
        await act(() => {
            renderWithRouter(<ProductCardImageCarousel images={mockImages} {...defaultProps} />);
        });
        const links = screen.getAllByRole("link");
        expect(links[0]).toHaveAttribute("href", "/product/shop-1/product-1");
    });
});
