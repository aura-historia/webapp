import type { ItemDetail } from "@/data/internal/ItemDetails.ts";
import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { ArrowUpRight, HeartIcon, Image, Share } from "lucide-react";
import { H3 } from "../typography/H3";

export function ItemInfo({ item }: { readonly item: ItemDetail }) {
    return (
        <Card className={"flex flex-col sm:flex-row p-8 gap-4 shadow-md min-w-0"}>
            <div className={"flex-shrink-0 flex sm:justify-start justify-center"}>
                {item.images.length > 0 ? (
                    <img
                        className={
                            "w-full h-64 sm:w-48 sm:h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover rounded-lg"
                        }
                        src={item.images[0].href}
                        alt=""
                    />
                ) : (
                    <div
                        className={
                            "w-full h-64 sm:w-48 sm:h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-neutral-100 rounded-lg flex items-center justify-center"
                        }
                    >
                        <Image
                            data-testid="placeholder-image"
                            className={"size-48 object-contain rounded-lg"}
                        />
                    </div>
                )}
            </div>
            <div className={"flex flex-col min-w-0 flex-1"}>
                <div className={"flex flex-row justify-between w-full"}>
                    <div className={"flex flex-col gap-2 min-w-0 overflow-hidden"}>
                        <H2 className={"text-ellipsis overflow-hidden line-clamp-1"}>
                            {item.title}
                        </H2>
                        <H3 variant={"muted"} className={"line-clamp-1 overflow-ellipsis"}>
                            {item.shopName}
                        </H3>
                        <p
                            className={
                                "text-sm text-muted-foreground overflow-hidden line-clamp-12 sm:line-clamp-2 md:line-clamp-8 lg:line-clamp-12"
                            }
                        >
                            {item.description ?? "Keine Beschreibung verfügbar"}
                        </p>
                        <StatusBadge status={item.state} />
                    </div>
                    <div className={"flex gap-2 ml-auto flex-shrink-0 self-start"}>
                        <Button variant={"ghost"} size={"icon"}>
                            <Share />
                        </Button>
                        <Button variant={"ghost"} size={"icon"}>
                            <HeartIcon />
                        </Button>
                    </div>
                </div>

                <div className={"hidden sm:block flex-1"}></div>

                <div
                    className={
                        "flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-end w-full mt-4 sm:mt-0"
                    }
                >
                    <PriceText className="flex-shrink-0">
                        {item.price ?? "Preis unbekannt"}
                    </PriceText>

                    <div className={"flex flex-col gap-2 sm:items-end flex-shrink-0 sm:ml-2"}>
                        <Button variant={"secondary"} className="whitespace-nowrap" asChild>
                            <a href={item.url?.href} target="_blank">
                                <ArrowUpRight />
                                <span>Zur Seite des Händlers</span>
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
