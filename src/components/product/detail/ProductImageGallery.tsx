import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import { ImageOff } from "lucide-react";
import { Lightbox } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";

interface ThumbnailButtonProps {
    readonly image: ProductImage;
    readonly index: number;
    readonly isSelected: boolean;
    readonly onSelect: (index: number) => void;
}

/**
 * Memoized thumbnail button to prevent re-renders when other thumbnails change.
 * Only re-renders when isSelected changes for this specific thumbnail.
 */
const ThumbnailButton = memo(function ThumbnailButton({
    image,
    index,
    isSelected,
    onSelect,
}: ThumbnailButtonProps) {
    return (
        <CarouselItem className="pl-2 basis-1/3">
            <button
                type="button"
                onClick={() => onSelect(index)}
                className={`aspect-square w-full rounded-md overflow-hidden border-2 transition-[opacity,border-color] duration-150 ${
                    isSelected
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                }`}
            >
                <ImageWithFallback
                    src={image.url.href}
                    alt={`Thumbnail ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover will-change-transform"
                />
            </button>
        </CarouselItem>
    );
});

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
    const prevLightboxOpen = useRef(false);

    /** Stable callback for thumbnail selection */
    const handleThumbnailSelect = useCallback((index: number) => {
        setCurrentImageIndex(index);
    }, []);

    /** Reset index when product changes */
    useEffect(() => {
        if (productId) setCurrentImageIndex(0);
    }, [productId]);

    /** Sync carousels when index changes or lightbox closes */
    useEffect(() => {
        const lightboxJustClosed = prevLightboxOpen.current && !isLightboxOpen;
        prevLightboxOpen.current = isLightboxOpen;

        if (!isLightboxOpen || lightboxJustClosed) {
            requestAnimationFrame(() => {
                mainCarouselApi?.scrollTo(currentImageIndex);
                thumbnailCarouselApi?.scrollTo(currentImageIndex);
            });
        }
    }, [currentImageIndex, isLightboxOpen, mainCarouselApi, thumbnailCarouselApi]);

    /** Sync state when user swipes the main carousel */
    useEffect(() => {
        if (!mainCarouselApi) return;

        const onSelect = () => {
            const index = mainCarouselApi.selectedScrollSnap();
            setCurrentImageIndex((prev) => (prev !== index ? index : prev));
        };

        mainCarouselApi.on("select", onSelect);
        return () => {
            mainCarouselApi.off("select", onSelect);
        };
    }, [mainCarouselApi]);

    /** Keyboard navigation (uses functional updater to avoid stale closures) */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen || images.length <= 1) return;

            if (e.key === "ArrowLeft") {
                setCurrentImageIndex((i) => Math.max(0, i - 1));
            } else if (e.key === "ArrowRight") {
                setCurrentImageIndex((i) => Math.min(images.length - 1, i + 1));
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);
        return () => globalThis.removeEventListener("keydown", handleKeyDown);
    }, [images.length, isLightboxOpen]);

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
                                    <ImageWithFallback
                                        src={images[currentImageIndex].url.href}
                                        loading={idx === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                        alt={`Produktbild von ${title}`}
                                        className="w-full aspect-square md:aspect-auto min-h-[200px] max-h-[350px] md:h-64 lg:h-80 object-cover rounded-lg hover:opacity-95 transition"
                                        fallbackClassName="w-full aspect-square md:aspect-auto min-h-[200px] max-h-[350px] md:h-64 lg:h-80 rounded-lg"
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
                                    <ThumbnailButton
                                        key={img.url.href}
                                        image={img}
                                        index={idx}
                                        isSelected={idx === currentImageIndex}
                                        onSelect={handleThumbnailSelect}
                                    />
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
