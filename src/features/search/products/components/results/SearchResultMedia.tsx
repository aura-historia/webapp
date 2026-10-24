import { ChevronLeft, ChevronRight, ImageIcon, ShieldAlert } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel.tsx";
import { isRestrictedImage, type ProductImage } from "@/data/internal/product/ProductImageData.ts";
import { HATCHED_PLACEHOLDER_CLASS } from "@/features/landing/components/common/ObjectCard.tsx";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { cn } from "@/lib/utils.ts";

const NAV_BUTTON_CLASS =
    "absolute top-1/2 z-10 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-pill bg-chip-on-image text-ink opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass";

function MediaPlaceholder({ restricted }: { readonly restricted?: boolean }) {
    const { t } = useTranslation();
    const Icon = restricted ? ShieldAlert : ImageIcon;
    return (
        <div
            className={cn(
                "flex size-full flex-col items-center justify-center gap-2.5 px-4 text-center",
                HATCHED_PLACEHOLDER_CLASS,
            )}
        >
            <Icon aria-hidden="true" className="size-7" strokeWidth={1.4} />
            <span className="font-mono text-tag tracking-[0.14em] uppercase">
                [{restricted ? t("product.prohibitedImage") : t("product.noImage")}]
            </span>
        </div>
    );
}

function Slide({
    image,
    showSensitiveContent,
    eager,
}: {
    readonly image: ProductImage;
    readonly showSensitiveContent: boolean;
    readonly eager: boolean;
}) {
    const [failed, setFailed] = useState(false);
    if (isRestrictedImage(image, showSensitiveContent)) return <MediaPlaceholder restricted />;
    if (failed || !image.url?.href) return <MediaPlaceholder />;
    return (
        <img
            src={image.url.href}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
            className="size-full object-cover"
        />
    );
}

type SearchResultMediaProps = {
    readonly images: readonly ProductImage[];
    readonly productListingTitleSlugId?: string;
    readonly showSensitiveContent: boolean;
    readonly onProductClick?: () => void;
};

/** The square photo of a result: swipe or arrow through its images, with an "n / N" count. */
export function SearchResultMedia({
    images,
    productListingTitleSlugId,
    showSensitiveContent,
    onProductClick,
}: SearchResultMediaProps) {
    const { t } = useTranslation();
    const [api, setApi] = useState<CarouselApi>();
    const [index, setIndex] = useState(0);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const onSelect = useCallback(() => {
        if (!api) return;
        setIndex(api.selectedScrollSnap());
        setCanPrev(api.canScrollPrev());
        setCanNext(api.canScrollNext());
    }, [api]);

    useEffect(() => {
        if (!api) return;
        onSelect();
        api.on("select", onSelect);
        api.on("reInit", onSelect);
        return () => {
            api.off("select", onSelect);
            api.off("reInit", onSelect);
        };
    }, [api, onSelect]);

    const link = (content: ReactNode) => (
        <ProductListingLink
            productListingTitleSlugId={productListingTitleSlugId}
            onClick={onProductClick}
            className="block size-full"
        >
            {content}
        </ProductListingLink>
    );

    if (images.length <= 1) {
        return (
            <div aria-hidden="true" className="size-full">
                {link(
                    images[0] ? (
                        <Slide
                            image={images[0]}
                            showSensitiveContent={showSensitiveContent}
                            eager
                        />
                    ) : (
                        <MediaPlaceholder />
                    ),
                )}
            </div>
        );
    }

    return (
        <div className="group size-full">
            <Carousel setApi={setApi} opts={{ loop: false }} className="size-full">
                <CarouselContent className="ml-0 h-full [&>div]:h-full" aria-hidden="true">
                    {images.map((image, i) => (
                        <CarouselItem
                            key={image.url?.href ?? `restricted-${i}`}
                            className="aspect-square pl-0"
                        >
                            {link(
                                <Slide
                                    image={image}
                                    showSensitiveContent={showSensitiveContent}
                                    eager={i === 0}
                                />,
                            )}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            {canPrev && (
                <button
                    type="button"
                    aria-label={t("product.previousImage")}
                    onClick={() => api?.scrollPrev()}
                    className={cn(NAV_BUTTON_CLASS, "left-2")}
                >
                    <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </button>
            )}
            {canNext && (
                <button
                    type="button"
                    aria-label={t("product.nextImage")}
                    onClick={() => api?.scrollNext()}
                    className={cn(NAV_BUTTON_CLASS, "right-2")}
                >
                    <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </button>
            )}
            <span
                aria-hidden="true"
                className="absolute right-2.5 bottom-2.5 rounded-sm bg-chip-on-image px-1.5 py-[3px] font-mono text-tag text-ink tabular-nums"
            >
                {index + 1} / {images.length}
            </span>
        </div>
    );
}
