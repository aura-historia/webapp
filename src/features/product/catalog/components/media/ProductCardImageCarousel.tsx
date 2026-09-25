import { useState, useEffect, useCallback } from "react";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel.tsx";
import { cn } from "@/lib/utils";
import { type ProductImage, isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "@/components/ui/image-with-fallback.tsx";
import { ProhibitedImagePlaceholder } from "@/features/product/catalog/components/media/ProhibitedImagePlaceholder.tsx";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";

interface ProductCardImageCarouselProps {
    readonly images: readonly ProductImage[];
    readonly productListingTitleSlugId?: string;
    readonly showSensitiveContent: boolean;
    readonly onProductClick?: () => void;
}

export function ProductCardImageCarousel({
    images,
    productListingTitleSlugId,
    showSensitiveContent,
    onProductClick,
}: ProductCardImageCarouselProps) {
    const { t } = useTranslation();
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [dotStart, setDotStart] = useState(0);

    const isRestrictedConsentGiven = showSensitiveContent;

    const onSelect = useCallback(() => {
        if (!carouselApi) return;
        const index = carouselApi.selectedScrollSnap();
        setSelectedIndex(index);
        setCanScrollPrev(carouselApi.canScrollPrev());
        setCanScrollNext(carouselApi.canScrollNext());
        setDotStart((prev) => {
            if (index < prev) return index;
            if (index >= prev + 10) return index - 9;
            return prev;
        });
    }, [carouselApi]);

    useEffect(() => {
        if (!carouselApi) return;
        onSelect();
        carouselApi.on("select", onSelect);
        carouselApi.on("reInit", onSelect);
        return () => {
            carouselApi.off("select", onSelect);
            carouselApi.off("reInit", onSelect);
        };
    }, [carouselApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => {
            if (!carouselApi) return;
            carouselApi.scrollTo(index);
        },
        [carouselApi],
    );

    const scrollPrev = useCallback(() => {
        if (!carouselApi) return;
        carouselApi.scrollPrev();
    }, [carouselApi]);

    const scrollNext = useCallback(() => {
        if (!carouselApi) return;
        carouselApi.scrollNext();
    }, [carouselApi]);

    if (images.length === 0) {
        return (
            <ProductListingLink
                productListingTitleSlugId={productListingTitleSlugId}
                onClick={onProductClick}
            >
                <div className="aspect-[4/3] w-full bg-muted flex flex-col items-center justify-center gap-2">
                    <ImageOff
                        data-testid="placeholder-image"
                        className="w-12 h-12 text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">{t("product.noImage")}</p>
                </div>
            </ProductListingLink>
        );
    }

    if (images.length === 1) {
        // Simple single image display without carousel complexity
        return (
            <ProductListingLink
                productListingTitleSlugId={productListingTitleSlugId}
                onClick={onProductClick}
            >
                {isRestrictedImage(images[0], isRestrictedConsentGiven) ? (
                    <ProhibitedImagePlaceholder className="w-full aspect-[4/3]" />
                ) : (
                    <ImageWithFallback
                        className="w-full aspect-[4/3]"
                        src={images[0].url?.href}
                        alt=""
                        fallbackClassName="w-full aspect-[4/3]"
                        loading="eager"
                        decoding="async"
                    />
                )}
            </ProductListingLink>
        );
    }

    return (
        <div className="group relative w-full overflow-hidden bg-surface-container-low">
            <Carousel
                setApi={setCarouselApi}
                opts={{
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={image.url?.href ?? `restricted-${index}`}>
                            <ProductListingLink
                                productListingTitleSlugId={productListingTitleSlugId}
                                onClick={onProductClick}
                            >
                                {isRestrictedImage(image, isRestrictedConsentGiven) ? (
                                    <ProhibitedImagePlaceholder className="w-full aspect-[4/3]" />
                                ) : (
                                    <ImageWithFallback
                                        className="w-full aspect-[4/3]"
                                        src={image.url?.href}
                                        alt=""
                                        loading={index === 0 ? "eager" : "lazy"}
                                        fallbackClassName="w-full aspect-[4/3]"
                                        decoding="async"
                                    />
                                )}
                            </ProductListingLink>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Custom navigation buttons - visible on hover for desktop */}
            {canScrollPrev && (
                <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-none bg-surface/80 p-2 text-primary opacity-0 backdrop-blur-[20px] transition-all duration-300 ease-out group-hover:opacity-100 hover:bg-surface"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        scrollPrev();
                    }}
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            {canScrollNext && (
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-none bg-surface/80 p-2 text-primary opacity-0 backdrop-blur-[20px] transition-all duration-300 ease-out group-hover:opacity-100 hover:bg-surface"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        scrollNext();
                    }}
                    aria-label="Next image"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {images.slice(dotStart, dotStart + 10).map((image, i) => (
                    <button
                        key={image.url?.href ?? `restricted-${dotStart + i}`}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            scrollTo(dotStart + i);
                        }}
                        className={cn(
                            "w-1.5 h-1.5 rounded-full transition-[width,background-color] duration-200",
                            dotStart + i === selectedIndex
                                ? "bg-white w-4"
                                : "bg-white/60 hover:bg-white/80",
                        )}
                        aria-label={`Go to image ${dotStart + i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
