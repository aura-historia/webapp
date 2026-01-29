import { useState, useEffect, useCallback } from "react";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel.tsx";
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
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!carouselApi) return;
        setSelectedIndex(carouselApi.selectedScrollSnap());
    }, [carouselApi]);

    useEffect(() => {
        if (!carouselApi) return;
        onSelect();
        carouselApi.on("select", onSelect);
        return () => {
            carouselApi.off("select", onSelect);
        };
    }, [carouselApi, onSelect]);

    const scrollTo = useCallback(
        (index: number) => {
            if (!carouselApi) return;
            carouselApi.scrollTo(index);
        },
        [carouselApi],
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
            <Carousel
                setApi={setCarouselApi}
                opts={{
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="rounded-lg">
                    {images.map((image, index) => (
                        <CarouselItem key={`${index}-${image.url.href}`}>
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
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

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
