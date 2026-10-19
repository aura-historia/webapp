import { ArrowLeft, ArrowRight, ImageIcon, ImageOff, Maximize, ShieldAlert } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbox } from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel.tsx";
import { isRestrictedImage, type ProductImage } from "@/data/internal/product/ProductImageData.ts";
import { HATCHED_PLACEHOLDER_CLASS } from "@/features/landing/components/common/ObjectCard.tsx";
import { cn } from "@/lib/utils.ts";

/** Thumbnails shown in the grid; with more images the last tile opens the lightbox. */
const MAX_THUMBNAILS = 6;

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";
const CHIP_BUTTON_CLASS = cn(
    "inline-flex cursor-pointer items-center justify-center rounded-pill bg-chip-on-image text-[#170D0E]",
    FOCUS_CLASS,
);

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

const MAX_DOTS = 5;

/**
 * Phone swipe hint: up to five dots in a window that follows the current image; an end dot
 * shrinks when more images lie beyond it.
 */
export function getSwipeDots(count: number, current: number) {
    const visible = Math.min(count, MAX_DOTS);
    const start = Math.max(0, Math.min(current - 2, count - visible));
    return Array.from({ length: visible }, (_, offset) => {
        const index = start + offset;
        const edge =
            (offset === 0 && start > 0) || (offset === visible - 1 && start + visible < count);
        return { index, active: index === current, edge };
    });
}

function SwipeDots({ count, current }: { readonly count: number; readonly current: number }) {
    return (
        <span
            aria-hidden="true"
            data-testid="gallery-swipe-dots"
            className="absolute bottom-[18px] left-1/2 inline-flex h-[18px] -translate-x-1/2 items-center gap-[5px] rounded-pill bg-chip-on-image px-[7px] sm:hidden"
        >
            {getSwipeDots(count, current).map((dot) => (
                <span
                    key={dot.index}
                    data-active={dot.active}
                    className={cn(
                        "rounded-pill transition-[width,height,background-color] duration-200 ease-out motion-reduce:transition-none",
                        dot.active
                            ? "size-1.5 bg-[#170D0E]"
                            : dot.edge
                              ? "size-1 bg-[rgba(23,13,14,0.32)]"
                              : "size-[5px] bg-[rgba(23,13,14,0.32)]",
                    )}
                />
            ))}
        </span>
    );
}

function imageKey(image: ProductImage, index: number): string {
    return image.url?.href ?? `restricted-${index}`;
}

/** Restricted, missing or broken images in the main frame. */
function MainPlaceholder({ kind }: { readonly kind: "restricted" | "failed" }) {
    const { t } = useTranslation();
    if (kind === "restricted") {
        return (
            <div className="flex size-full flex-col items-center justify-center gap-3.5 bg-surface-sunken p-7 text-center shadow-ring">
                <span
                    aria-hidden="true"
                    className="inline-flex size-12 items-center justify-center rounded-pill bg-surface-raised text-oxblood shadow-ring"
                >
                    <ShieldAlert className="size-5" strokeWidth={1.8} />
                </span>
                <p className="max-w-[200px] text-body-sm text-ink-secondary">
                    {t("product.prohibitedImage")}
                </p>
            </div>
        );
    }
    return (
        <div className="flex size-full flex-col items-center justify-center gap-3 bg-image-ground p-7 text-center text-[#4F4441]">
            <ImageOff aria-hidden="true" className="size-7" strokeWidth={1.5} />
            <p className="text-body-sm">{t("product.imageLoadError")}</p>
        </div>
    );
}

function MainSlide({
    image,
    index,
    count,
    title,
    showSensitiveContent,
    onOpen,
}: {
    readonly image: ProductImage;
    readonly index: number;
    readonly count: number;
    readonly title: string;
    readonly showSensitiveContent: boolean;
    readonly onOpen: () => void;
}) {
    const { t } = useTranslation();
    const [failed, setFailed] = useState(false);

    if (isRestrictedImage(image, showSensitiveContent))
        return <MainPlaceholder kind="restricted" />;
    if (failed || !image.url?.href) return <MainPlaceholder kind="failed" />;

    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label={t("product.gallery.openImage", { index: index + 1, count })}
            className={cn("block size-full cursor-zoom-in overflow-hidden", FOCUS_CLASS)}
        >
            <img
                src={image.url.href}
                alt={t("product.gallery.imageAlt", { title, index: index + 1 })}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                onError={() => setFailed(true)}
                // The whole object stays visible; the image ground pads the frame around it.
                className="size-full object-contain"
            />
        </button>
    );
}

const Thumbnail = memo(function Thumbnail({
    image,
    index,
    isSelected,
    showSensitiveContent,
    onSelect,
    className,
}: {
    readonly image: ProductImage;
    readonly index: number;
    readonly isSelected: boolean;
    readonly showSensitiveContent: boolean;
    readonly onSelect: (index: number) => void;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const [failed, setFailed] = useState(false);
    const restricted = isRestrictedImage(image, showSensitiveContent);

    return (
        <button
            type="button"
            aria-label={t("product.gallery.showImage", { index: index + 1 })}
            aria-current={isSelected}
            onClick={() => onSelect(index)}
            className={cn(
                "aspect-square cursor-pointer overflow-hidden bg-image-ground transition-opacity",
                isSelected ? "opacity-100 shadow-selected" : "opacity-70 hover:opacity-100",
                FOCUS_CLASS,
                className,
            )}
        >
            {restricted ? (
                <span className="flex size-full items-center justify-center bg-surface-sunken text-oxblood">
                    <ShieldAlert aria-hidden="true" className="size-4" strokeWidth={1.8} />
                </span>
            ) : failed || !image.url?.href ? (
                <span className="flex size-full items-center justify-center text-[#4F4441]">
                    <ImageOff aria-hidden="true" className="size-4" strokeWidth={1.6} />
                </span>
            ) : (
                <img
                    src={image.url.href}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed(true)}
                    className="size-full object-cover"
                />
            )}
        </button>
    );
});

interface ProductImageGalleryProps {
    readonly images: readonly ProductImage[];
    readonly productId: string;
    readonly title?: string;
    readonly showSensitiveContent?: boolean;
}

export function ProductImageGallery({
    images,
    productId,
    title = "",
    showSensitiveContent = false,
}: ProductImageGalleryProps) {
    const { t } = useTranslation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [mainCarouselApi, setMainCarouselApi] = useState<CarouselApi>();
    const prevLightboxOpen = useRef(false);

    /** Only images with actual URLs can be shown in the lightbox */
    const lightboxSlides = useMemo(
        () =>
            images
                .filter(
                    (img): img is ProductImage & { url: URL } =>
                        !isRestrictedImage(img, showSensitiveContent),
                )
                .map((img) => ({ src: img.url.href })),
        [images, showSensitiveContent],
    );

    const handleSelect = useCallback((index: number) => setCurrentImageIndex(index), []);

    /** Reset index when product changes */
    useEffect(() => {
        if (productId) setCurrentImageIndex(0);
    }, [productId]);

    /** Sync the carousel when the index changes or the lightbox closes */
    useEffect(() => {
        const lightboxJustClosed = prevLightboxOpen.current && !isLightboxOpen;
        prevLightboxOpen.current = isLightboxOpen;
        if (!isLightboxOpen || lightboxJustClosed) {
            requestAnimationFrame(() => mainCarouselApi?.scrollTo(currentImageIndex));
        }
    }, [currentImageIndex, isLightboxOpen, mainCarouselApi]);

    /** Sync state when the user swipes the main image */
    useEffect(() => {
        if (!mainCarouselApi) return;
        const onSelect = () => {
            const index = mainCarouselApi.selectedScrollSnap();
            setCurrentImageIndex((prev) => (prev === index ? prev : index));
        };
        mainCarouselApi.on("select", onSelect);
        return () => {
            mainCarouselApi.off("select", onSelect);
        };
    }, [mainCarouselApi]);

    /** Arrow keys page through images while the lightbox is closed */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen || images.length <= 1) return;
            if (e.key === "ArrowLeft") setCurrentImageIndex((i) => Math.max(0, i - 1));
            else if (e.key === "ArrowRight") {
                setCurrentImageIndex((i) => Math.min(images.length - 1, i + 1));
            }
        };
        globalThis.addEventListener("keydown", handleKeyDown);
        return () => globalThis.removeEventListener("keydown", handleKeyDown);
    }, [images.length, isLightboxOpen]);

    if (images.length === 0) {
        return (
            <div
                className={cn(
                    "flex aspect-[4/5] flex-col items-center justify-center gap-3 p-6 text-center max-sm:-mx-(--page-gutter) sm:rounded-figure",
                    HATCHED_PLACEHOLDER_CLASS,
                )}
            >
                <ImageIcon aria-hidden="true" className="size-8" strokeWidth={1.4} />
                <p className="font-mono text-tag tracking-[0.14em] text-[#4F4441] uppercase">
                    {t("product.noImage")}
                </p>
            </div>
        );
    }

    /** Lightbox index for a gallery index; -1 when that image is restricted. */
    const getLightboxIndex = (galleryIndex: number): number => {
        const img = images[galleryIndex];
        if (!img || isRestrictedImage(img, showSensitiveContent)) return -1;
        return images
            .slice(0, galleryIndex)
            .filter((image) => !isRestrictedImage(image, showSensitiveContent)).length;
    };

    /** Gallery index for a lightbox index, skipping restricted images. */
    const getGalleryIndex = (lightboxIndex: number): number => {
        let count = 0;
        for (let i = 0; i < images.length; i++) {
            if (!isRestrictedImage(images[i], showSensitiveContent)) {
                if (count === lightboxIndex) return i;
                count++;
            }
        }
        return 0;
    };

    const openLightboxAt = (galleryIndex: number) => {
        if (getLightboxIndex(galleryIndex) < 0) return;
        setCurrentImageIndex(galleryIndex);
        setIsLightboxOpen(true);
    };

    const hasMany = images.length > 1;
    const gridThumbnails = images.slice(0, MAX_THUMBNAILS);
    const canOpenCurrent = getLightboxIndex(currentImageIndex) >= 0;
    const lastTileIndex = MAX_THUMBNAILS - 1;
    /**
     * The "+N" tile opens the first image the lightbox can show from the tile on, else the first
     * one anywhere; without any, the tile stays an ordinary thumbnail.
     */
    const isViewable = (index: number) => getLightboxIndex(index) >= 0;
    const overflowTarget = (() => {
        if (images.length <= MAX_THUMBNAILS) return -1;
        const after = images.findIndex((_, index) => index >= lastTileIndex && isViewable(index));
        return after >= 0 ? after : images.findIndex((_, index) => isViewable(index));
    })();
    const overflowing = overflowTarget >= 0;

    return (
        <>
            <div className="flex min-w-0 flex-col gap-3">
                <div className="group relative aspect-[4/5] overflow-hidden bg-image-ground max-sm:-mx-(--page-gutter) sm:rounded-figure">
                    <Carousel
                        setApi={setMainCarouselApi}
                        opts={{ loop: false }}
                        className="size-full"
                    >
                        <CarouselContent className="ml-0 h-full">
                            {images.map((img, idx) => (
                                <CarouselItem
                                    key={imageKey(img, idx)}
                                    className="aspect-[4/5] pl-0"
                                >
                                    <MainSlide
                                        image={img}
                                        index={idx}
                                        count={images.length}
                                        title={title}
                                        showSensitiveContent={showSensitiveContent}
                                        onOpen={() => openLightboxAt(idx)}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {hasMany && (
                        <>
                            <button
                                type="button"
                                aria-label={t("product.previousImage")}
                                disabled={currentImageIndex === 0}
                                onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
                                className={cn(
                                    CHIP_BUTTON_CLASS,
                                    "absolute top-1/2 left-4 size-11 -translate-y-1/2 disabled:pointer-events-none disabled:opacity-0 max-sm:hidden",
                                )}
                            >
                                <ArrowLeft
                                    aria-hidden="true"
                                    className="size-[18px]"
                                    strokeWidth={1.8}
                                />
                            </button>
                            <button
                                type="button"
                                aria-label={t("product.nextImage")}
                                disabled={currentImageIndex === images.length - 1}
                                onClick={() =>
                                    setCurrentImageIndex((i) => Math.min(images.length - 1, i + 1))
                                }
                                className={cn(
                                    CHIP_BUTTON_CLASS,
                                    "absolute top-1/2 right-4 size-11 -translate-y-1/2 disabled:pointer-events-none disabled:opacity-0 max-sm:hidden",
                                )}
                            >
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-[18px]"
                                    strokeWidth={1.8}
                                />
                            </button>
                            <span
                                aria-hidden="true"
                                data-testid="gallery-counter"
                                className="absolute bottom-4 left-4 rounded-sm bg-chip-on-image px-2 py-[5px] font-mono text-tag tracking-[0.14em] text-[#170D0E]"
                            >
                                {pad(currentImageIndex + 1)} / {pad(images.length)}
                            </span>
                            <SwipeDots count={images.length} current={currentImageIndex} />
                        </>
                    )}

                    {canOpenCurrent && (
                        <button
                            type="button"
                            aria-label={t("product.gallery.viewFullScreen")}
                            onClick={() => openLightboxAt(currentImageIndex)}
                            className={cn(
                                CHIP_BUTTON_CLASS,
                                "absolute right-3 bottom-3 h-9 gap-1.5 px-3 text-meta font-medium",
                            )}
                        >
                            <Maximize aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                            <span className="max-sm:sr-only">
                                {t("product.gallery.fullScreen")}
                            </span>
                        </button>
                    )}
                </div>

                {hasMany && (
                    <>
                        <div
                            role="group"
                            aria-label={t("product.gallery.chooseImage")}
                            className="-mx-(--page-gutter) flex gap-2 overflow-x-auto px-(--page-gutter) pt-1 pb-1 [scrollbar-width:none] sm:hidden"
                        >
                            {images.map((img, idx) => (
                                <Thumbnail
                                    key={imageKey(img, idx)}
                                    image={img}
                                    index={idx}
                                    isSelected={idx === currentImageIndex}
                                    showSensitiveContent={showSensitiveContent}
                                    onSelect={handleSelect}
                                    className="w-15 shrink-0 rounded-thumb"
                                />
                            ))}
                        </div>
                        <div
                            role="group"
                            aria-label={t("product.gallery.chooseImage")}
                            className="hidden grid-cols-6 gap-3 sm:grid"
                        >
                            {gridThumbnails.map((img, idx) =>
                                overflowing && idx === lastTileIndex ? (
                                    <button
                                        key={imageKey(img, idx)}
                                        type="button"
                                        aria-label={t("product.gallery.showAll", {
                                            count: images.length,
                                        })}
                                        onClick={() => openLightboxAt(overflowTarget)}
                                        className={cn(
                                            "relative aspect-square cursor-pointer overflow-hidden rounded-md bg-image-ground",
                                            FOCUS_CLASS,
                                        )}
                                    >
                                        {img.url?.href &&
                                            !isRestrictedImage(img, showSensitiveContent) && (
                                                <img
                                                    src={img.url.href}
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="size-full object-cover"
                                                />
                                            )}
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-0 flex items-center justify-center bg-[rgba(23,13,14,0.62)] font-serif text-[22px] text-[#F4EEE3]"
                                        >
                                            +{images.length - lastTileIndex}
                                        </span>
                                    </button>
                                ) : (
                                    <Thumbnail
                                        key={imageKey(img, idx)}
                                        image={img}
                                        index={idx}
                                        isSelected={idx === currentImageIndex}
                                        showSensitiveContent={showSensitiveContent}
                                        onSelect={handleSelect}
                                        className="rounded-md"
                                    />
                                ),
                            )}
                        </div>
                    </>
                )}
            </div>

            <Lightbox
                open={isLightboxOpen}
                close={() => setIsLightboxOpen(false)}
                slides={lightboxSlides}
                index={Math.max(0, getLightboxIndex(currentImageIndex))}
                plugins={[Zoom, Thumbnails]}
                styles={{
                    container: { backgroundColor: "rgba(23, 13, 14, 0.97)" },
                    thumbnailsContainer: { backgroundColor: "rgba(23, 13, 14, 0.97)" },
                }}
                on={{ view: ({ index }) => setCurrentImageIndex(getGalleryIndex(index)) }}
            />
        </>
    );
}
