import type { ItemDetail } from "@/data/internal/ItemDetails.ts";
import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { ArrowUpRight, HeartIcon, Share } from "lucide-react";
import { H3 } from "../typography/H3";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { ItemImageGallery } from "@/components/item/ItemImageGallery.tsx";

export function ItemInfo({ item }: { readonly item: ItemDetail }) {
    return (
        <>
            <Card className="flex flex-col md:flex-row p-8 gap-4 shadow-md min-w-0">
                <div className="flex-shrink-0 flex sm:justify-start justify-center">
                    <ItemImageGallery
                        images={item.images}
                        title={item.title}
                        itemId={item.itemId}
                    />
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
                    <p className="scrollable-content text-base text-muted-foreground overflow-y-auto max-h-[250px] md:max-h-[130px] lg:max-h-[200px] w-full pr-3">
                        {item.description ?? "Keine Beschreibung verfügbar"}
                    </p>

                    {/* Spacer - pushes bottom content down on desktop */}
                    <div className="hidden sm:block flex-1"></div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-end w-full pt-4">
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
        </>
    );
}
