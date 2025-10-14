import { useMemo, useState, useEffect } from "react";
import type { ItemDetail } from "@/data/internal/ItemDetails.ts";
import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowUpRight, HeartIcon, Share, ChevronLeft, ChevronRight } from "lucide-react";
import { H3 } from "../typography/H3";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export function ItemInfo({ item }: { readonly item: ItemDetail }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const slides = useMemo(() => item.images.map((img) => ({ src: img.href })), [item.images]);

    const { itemId } = item;

    /**
     * Resets the image index to 0 when the ‘item’ changes.
     * This prevents errors if the new ‘item’ has fewer images than the previous one.
     */
    // biome-ignore lint/correctness/useExhaustiveDependencies: itemId needed when item changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [itemId]);

    /**
     * Registers a `keydown` event listener for carousel image navigation.
     *
     * The handler function ignores arrow key events when the lightbox
     * is active or there are fewer than two images.
     *
     * The cleanup function reliably removes the listener before unmounting
     * or re-executing the effect to prevent memory leaks.
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLightboxOpen || item.images.length <= 1) return;

            if (e.key === "ArrowLeft") {
                setCurrentImageIndex((i) => (i === 0 ? item.images.length - 1 : i - 1));
            } else if (e.key === "ArrowRight") {
                setCurrentImageIndex((i) => (i + 1) % item.images.length);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [item.images.length, isLightboxOpen]);

    return (
        <>
            <Card className="flex flex-col md:flex-row p-8 gap-4 shadow-md min-w-0">
                <div className="flex-shrink-0 flex sm:justify-start justify-center">
                    <div className="w-full md:w-80 lg:w-96 space-y-3">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsLightboxOpen(true)}
                                className="w-full block"
                            >
                                <img
                                    src={item.images[currentImageIndex].href}
                                    alt={`Produktbild von ${item.title}`}
                                    className="w-full min-h-[200px] max-h-[350px] h-auto md:h-64 lg:h-80 object-cover rounded-lg hover:opacity-95 transition"
                                />
                            </button>

                            {/* Navigation buttons - only visible with 2+ images */}
                            {item.images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        className=" absolute left-2 top-1/2 -translate-y-1/2 bg-black/50
                            hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                        onClick={() =>
                                            setCurrentImageIndex((i) =>
                                                i === 0 ? item.images.length - 1 : i - 1,
                                            )
                                        }
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                        onClick={() =>
                                            setCurrentImageIndex(
                                                (i) => (i + 1) % item.images.length,
                                            )
                                        }
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail carousel - only visible with 2+ images */}
                        {item.images.length > 1 && (
                            <div className="relative px-10">
                                <Carousel
                                    opts={{
                                        align: "start",
                                        containScroll: "trimSnaps",
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent
                                        className={`-ml-2 ${
                                            item.images.length <= 2 ? "justify-center" : ""
                                        }`}
                                    >
                                        {item.images.map((img, idx) => (
                                            <CarouselItem key={img.href} className="pl-2 basis-1/3">
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
                                                        src={img.href}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="absolute -left-10 top-1/2 -translate-y-1/2" />
                                    <CarouselNext className="absolute -right-10 top-1/2 -translate-y-1/2" />
                                </Carousel>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-row justify-between w-full">
                        <div className="flex flex-col gap-2 min-w-0 overflow-hidden">
                            <H2 className="overflow-hidden line-clamp-3 md:line-clamp-2 lg:line-clamp-2 text-[26px]">
                                {item.title}
                            </H2>
                            <H3 variant="muted" className="overflow-hidden line-clamp-1 text-lg">
                                {item.shopName}
                            </H3>
                            <p className="text-base text-muted-foreground overflow-y-auto max-h-[250px] md:max-h-[130px] lg:max-h-[200px]">
                                {" "}
                                {item.description ?? "Keine Beschreibung verfügbar"}
                            </p>
                        </div>
                        <div className="hidden md:flex gap-2 ml-auto flex-shrink-0 self-start">
                            <Button variant="ghost" size="icon">
                                <Share />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <HeartIcon />
                            </Button>
                        </div>
                    </div>

                    {/* Spacer - pushes bottom content down on desktop */}
                    <div className="hidden sm:block flex-1"></div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-end w-full mt-4 sm:mt-0">
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <StatusBadge status={item.state} />
                            <PriceText>{item.price ?? "Preis unbekannt"}</PriceText>
                        </div>

                        <div className="flex flex-col gap-2 sm:items-end flex-shrink-0 sm:ml-2">
                            <Button variant="secondary" className="whitespace-nowrap" asChild>
                                <a href={item.url?.href} target="_blank" rel="noopener noreferrer">
                                    <ArrowUpRight />
                                    <span>Zur Seite des Händlers</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            <div className="fixed top-24 right-4 flex flex-col gap-2 md:hidden z-40">
                <Button size="icon" className="shadow-lg rounded-full">
                    <Share className="w-4 h-4" />
                </Button>
                <Button size="icon" className="shadow-lg rounded-full">
                    <HeartIcon className="w-4 h-4" />
                </Button>
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
