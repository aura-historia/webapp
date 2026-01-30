import { useEffect, useMemo, useState } from "react";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import { ImageOff } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";

interface ProductImageGalleryProps {
    readonly images: readonly ProductImage[];
    readonly title: string;
    readonly productId: string;
}

export function ProductImageGallery({ images, title, productId }: ProductImageGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const slides = useMemo(() => images.map((img) => ({ src: img.url.href })), [images]);
    const [mainCarouselApi, setMainCarouselApi] = useState<CarouselApi>();
    const [thumbnailCarouselApi, setThumbnailCarouselApi] = useState<CarouselApi>();

    /**
     * Resets the image index to 0 when the product changes.
     * This prevents errors if the new product has fewer images than the previous one.
     * The carousel sync happens automatically via the second useEffect when currentImageIndex changes.
     */
    useEffect(() => {
        if (!productId) return;
        setCurrentImageIndex(0);
    }, [productId]);

    /**
     * Syncs both carousels when currentImageIndex changes.
     */
    useEffect(() => {
        mainCarouselApi?.scrollTo(currentImageIndex);
        thumbnailCarouselApi?.scrollTo(currentImageIndex);
    }, [currentImageIndex, mainCarouselApi, thumbnailCarouselApi]);

    /**
     * Syncs the main carousel's selected index with the current image index state.
     * This ensures the state updates when user swipes/drags the main carousel.
     */
    useEffect(() => {
        if (!mainCarouselApi) return;

        const onSelect = () => {
            const index = mainCarouselApi.selectedScrollSnap();
            setCurrentImageIndex(index);
        };

        mainCarouselApi.on("select", onSelect);
        return () => {
            mainCarouselApi.off("select", onSelect);
        };
    }, [mainCarouselApi]);

    /**
     * Registers a keydown event listener for carousel image navigation.
     *
     * The handler function ignores arrow key events when the lightbox
     * is active or there are fewer than two images.
     * Navigation stops at the beginning and end (no loop).
     *
     * The cleanup function reliably removes the listener before unmounting
     * or re-executing the effect to prevent memory leaks.
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen || images.length <= 1) return;

            if (e.key === "ArrowLeft" && currentImageIndex > 0) {
                setCurrentImageIndex((i) => i - 1);
            } else if (e.key === "ArrowRight" && currentImageIndex < images.length - 1) {
                setCurrentImageIndex((i) => i + 1);
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);
        return () => globalThis.removeEventListener("keydown", handleKeyDown);
    }, [images.length, isLightboxOpen, currentImageIndex]);

    /**
     * Renders a fallback image if no images are provided.
     *
     * If the `images` array is empty, this returns a placeholder
     * with an icon and a text message
     */
    if (images.length === 0) {
        return (
            <div className="w-full md:w-80 lg:w-96">
                <div className="w-full aspect-square md:aspect-auto min-h-[200px] max-h-[350px] md:h-64 lg:h-80 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                    <ImageOff className="w-12 h-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Kein Bild verfügbar</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full md:w-80 lg:w-96 space-y-3">
                {/* Main image carousel with swipe support */}
                <Carousel
                    setApi={setMainCarouselApi}
                    opts={{
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {images.map((img, idx) => (
                            <CarouselItem key={img.url.href}>
                                <button
                                    type="button"
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="w-full block"
                                >
                                    <img
                                        src={img.url.href}
                                        alt={`Produktbild von ${title}`}
                                        loading={idx === 0 ? "eager" : "lazy"}
                                        className="w-full aspect-square md:aspect-auto min-h-[200px] max-h-[350px] md:h-64 lg:h-80 object-cover rounded-lg hover:opacity-95 transition"
                                    />
                                </button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Library navigation buttons - only visible with 2+ images */}
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious />
                            <CarouselNext />
                        </>
                    )}
                </Carousel>

                {/* Thumbnail carousel - only visible with 2+ images */}
                {images.length > 1 && (
                    <div className="relative px-10">
                        <Carousel
                            setApi={setThumbnailCarouselApi}
                            opts={{
                                align: "start",
                                containScroll: "trimSnaps",
                            }}
                            className="w-full"
                        >
                            <CarouselContent
                                className={`-ml-2 ${images.length <= 2 ? "justify-center" : ""}`}
                            >
                                {images.map((img, idx) => (
                                    <CarouselItem key={img.url.href} className="pl-2 basis-1/3">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`
                                                aspect-square w-full rounded-md overflow-hidden transition-all
                                                ${
                                                    idx === currentImageIndex
                                                        ? "border-2 border-primary"
                                                        : "opacity-60 hover:opacity-100 border-2 border-transparent"
                                                } 
                                            `}
                                        >
                                            <img
                                                src={img.url.href}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="-left-10" />
                            <CarouselNext className="-right-10" />
                        </Carousel>
                    </div>
                )}
            </div>

            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                slides={slides}
                index={currentImageIndex}
                plugins={[Zoom, Thumbnails]}
                on={{ view: ({ index }) => setCurrentImageIndex(index) }}
            />
        </>
    );
}
