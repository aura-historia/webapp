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
import { type ProductImage, isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { ProhibitedImagePlaceholder } from "@/components/common/ProhibitedImagePlaceholder.tsx";
import type { UserProductData } from "@/data/internal/product/UserProductData.ts";

interface ThumbnailButtonProps {
    readonly image: ProductImage;
    readonly isRestrictedImageConsentGiven: boolean;
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
    isRestrictedImageConsentGiven,
    index,
    isSelected,
    onSelect,
}: ThumbnailButtonProps) {
    return (
        <CarouselItem className="pl-0 basis-1/4">
            <button
                type="button"
                onClick={() => onSelect(index)}
                className={`aspect-square w-full overflow-hidden border transition-[opacity,border-color] duration-300 ease-out ${
                    isSelected
                        ? "border-primary opacity-100"
                        : "border-outline-variant/20 opacity-70 hover:opacity-100"
                }`}
            >
                {isRestrictedImage(image, isRestrictedImageConsentGiven) ? (
                    <ProhibitedImagePlaceholder className="w-full h-full" showLabel={false} />
                ) : (
                    <ImageWithFallback
                        src={image.url?.href}
                        alt={`Thumbnail ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        showErrorMessage={false}
                        className="w-full h-full object-cover will-change-transform"
                    />
                )}
            </button>
        </CarouselItem>
    );
});

function imageKey(image: ProductImage, index: number): string {
    return image.url?.href ?? `restricted-${index}`;
}

interface ProductImageGalleryProps {
    readonly images: readonly ProductImage[];
    readonly productId: string;
    readonly userData?: UserProductData;
}

export function ProductImageGallery({ images, productId, userData }: ProductImageGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const isRestrictedConsentGiven = userData?.restrictedContentData.consentGiven ?? false;

    /** Only images with actual URLs can be shown in the lightbox */
    const lightboxSlides = useMemo(
        () =>
            images
                .filter(
                    (img): img is ProductImage & { url: URL } =>
                        !isRestrictedImage(img, isRestrictedConsentGiven),
                )
                .map((img) => ({ src: img.url.href })),
        [images, isRestrictedConsentGiven],
    );

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
            <div className="w-full">
                <div className="w-full aspect-[5/6] bg-surface-container-low flex flex-col items-center justify-center gap-2">
                    <ImageOff className="w-12 h-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Kein Bild verfügbar</p>
                </div>
            </div>
        );
    }

    /**
     * Computes the lightbox slide index for a given carousel index.
     * Restricted images are excluded from the lightbox, so the index mapping
     * skips over them. Returns -1 if the current image is restricted.
     */
    const getLightboxIndex = (carouselIndex: number, consent: boolean): number => {
        const img = images[carouselIndex];
        if (!img || isRestrictedImage(img, consent)) return -1;
        let lightboxIdx = 0;
        for (let i = 0; i < carouselIndex; i++) {
            if (!isRestrictedImage(images[i], consent)) lightboxIdx++;
        }
        return lightboxIdx;
    };

    /**
     * Converts a lightbox slide index back to the corresponding carousel index.
     * Needed because the lightbox only contains non-restricted images.
     */
    const getCarouselIndex = (lightboxIndex: number, consent: boolean): number => {
        let count = 0;
        for (let i = 0; i < images.length; i++) {
            if (!isRestrictedImage(images[i], consent)) {
                if (count === lightboxIndex) return i;
                count++;
            }
        }
        return 0;
    };

    const handleMainImageClick = (carouselIndex: number, consent: boolean) => {
        const lightboxIdx = getLightboxIndex(carouselIndex, consent);
        if (lightboxIdx >= 0) {
            setIsLightboxOpen(true);
        }
    };

    return (
        <>
            <div className="w-full space-y-6">
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
                            <CarouselItem key={imageKey(img, idx)}>
                                {isRestrictedImage(img, isRestrictedConsentGiven) ? (
                                    <ProhibitedImagePlaceholder className="w-full aspect-[5/6]" />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleMainImageClick(idx, isRestrictedConsentGiven)
                                        }
                                        className="w-full block"
                                    >
                                        <ImageWithFallback
                                            src={img.url?.href}
                                            loading={idx === 0 ? "eager" : "lazy"}
                                            decoding="async"
                                            alt={""}
                                            className="w-full aspect-[5/6] object-cover hover:opacity-95 transition-opacity duration-300 ease-out"
                                            fallbackClassName="w-full aspect-[5/6]"
                                        />
                                    </button>
                                )}
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Library navigation buttons - only visible with 2+ images */}
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious className="left-3 rounded-none border-0 bg-primary/90 text-primary-foreground hover:bg-primary" />
                            <CarouselNext className="right-3 rounded-none border-0 bg-primary/90 text-primary-foreground hover:bg-primary" />
                        </>
                    )}
                </Carousel>

                {/* Thumbnail carousel - only visible with 2+ images */}
                {images.length > 1 && (
                    <div className="relative">
                        <Carousel
                            setApi={setThumbnailCarouselApi}
                            opts={{
                                align: "start",
                                containScroll: "trimSnaps",
                            }}
                            className="w-full"
                        >
                            <CarouselContent
                                className={`-ml-0 ${images.length <= 4 ? "justify-center" : ""}`}
                            >
                                {images.map((img, idx) => (
                                    <ThumbnailButton
                                        key={imageKey(img, idx)}
                                        isRestrictedImageConsentGiven={isRestrictedConsentGiven}
                                        image={img}
                                        index={idx}
                                        isSelected={idx === currentImageIndex}
                                        onSelect={handleThumbnailSelect}
                                    />
                                ))}
                            </CarouselContent>
                            {images.length > 4 && (
                                <>
                                    <CarouselPrevious className="-left-10 rounded-none border-0 bg-primary/90 text-primary-foreground hover:bg-primary" />
                                    <CarouselNext className="-right-10 rounded-none border-0 bg-primary/90 text-primary-foreground hover:bg-primary" />
                                </>
                            )}
                        </Carousel>
                    </div>
                )}
            </div>

            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                slides={lightboxSlides}
                index={getLightboxIndex(currentImageIndex, isRestrictedConsentGiven)}
                plugins={[Zoom, Thumbnails]}
                on={{
                    view: ({ index }) =>
                        setCurrentImageIndex(getCarouselIndex(index, isRestrictedConsentGiven)),
                }}
            />
        </>
    );
}
