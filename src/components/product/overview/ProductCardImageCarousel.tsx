import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/data/internal/product/ProductImageData.ts";
import { ImageOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

interface ProductCardImageCarouselProps {
    readonly images: readonly ProductImage[];
    readonly shopId: string;
    readonly shopsProductId: string;
}

export function ProductCardImageCarousel({
    images,
    shopId,
    shopsProductId,
}: ProductCardImageCarouselProps) {
    const { t } = useTranslation();
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => {
            if (!emblaApi) return;
            emblaApi.scrollTo(index);
        },
        [emblaApi],
    );

    if (images.length === 0) {
        return (
            <Link
                to="/product/$shopId/$shopsProductId"
                params={{
                    shopId,
                    shopsProductId,
                }}
            >
                <div className="size-48 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                    <ImageOff
                        data-testid="placeholder-image"
                        className="w-12 h-12 text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">{t("product.noImage")}</p>
                </div>
            </Link>
        );
    }

    if (images.length === 1) {
        // Simple single image display without carousel complexity
        return (
            <Link
                to="/product/$shopId/$shopsProductId"
                params={{
                    shopId,
                    shopsProductId,
                }}
            >
                <img
                    className="w-full aspect-video object-cover hover:opacity-90 transition-opacity lg:size-48 lg:aspect-auto rounded-lg"
                    src={images[0].url.href}
                    alt=""
                />
            </Link>
        );
    }

    return (
        <div className="relative w-full lg:w-48">
            <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {images.map((image, index) => (
                        <div key={`${index}-${image.url.href}`} className="flex-[0_0_100%] min-w-0">
                            <Link
                                to="/product/$shopId/$shopsProductId"
                                params={{
                                    shopId,
                                    shopsProductId,
                                }}
                            >
                                <img
                                    className="w-full aspect-video object-cover hover:opacity-90 transition-opacity lg:size-48 lg:aspect-auto rounded-lg"
                                    src={image.url.href}
                                    alt=""
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {images.map((image, index) => (
                    <button
                        key={`${index}-${image.url.href}`}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            scrollTo(index);
                        }}
                        className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all",
                            index === selectedIndex
                                ? "bg-white w-4"
                                : "bg-white/60 hover:bg-white/80",
                        )}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
