import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { PriceText } from "@/components/typography/PriceText.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewItem } from "@/data/internal/OverviewItem.ts";
import { ArrowUpRight, Eye, HeartIcon, ImageOff } from "lucide-react";
import { H3 } from "../typography/H3";
import { Link } from "@tanstack/react-router";

export function ItemCard({ item }: { readonly item: OverviewItem }) {
    return (
        <Card className={"flex flex-col lg:flex-row p-8 gap-4 shadow-md min-w-0"}>
            <div className={"flex-shrink-0 flex lg:justify-start justify-center"}>
                <Link
                    to="/item/$shopId/$shopsItemId"
                    params={{
                        shopId: item.shopId,
                        shopsItemId: item.shopsItemId,
                    }}
                >
                    {item.images.length > 0 ? (
                        <img
                            className={
                                "size-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                            }
                            src={item.images[0].href}
                            alt=""
                        />
                    ) : (
                        <div className="size-48 bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
                            <ImageOff className="w-12 h-12 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Kein Bild verfügbar</p>
                        </div>
                    )}
                </Link>
            </div>
            <div className={"flex flex-col min-w-0 flex-1 justify-between"}>
                <div className={"flex flex-row justify-between w-full"}>
                    <div className={"flex flex-col gap-2 min-w-0 overflow-hidden"}>
                        <Link
                            to="/item/$shopId/$shopsItemId"
                            params={{
                                shopId: item.shopId,
                                shopsItemId: item.shopsItemId,
                            }}
                            className="min-w-0 overflow-hidden"
                        >
                            <H2
                                className={
                                    "text-ellipsis overflow-hidden line-clamp-1 hover:underline"
                                }
                            >
                                {item.title}
                            </H2>
                        </Link>
                        <H3
                            variant={"muted"}
                            className={"line-clamp-1 overflow-ellipsis whitespace-nowrap"}
                        >
                            {item.shopName}
                        </H3>
                        <StatusBadge status={item.state} />
                    </div>

                    <Button variant={"ghost"} size={"icon"} className={"ml-auto flex-shrink-0"}>
                        <HeartIcon />
                    </Button>
                </div>

                <div
                    className={
                        "flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between lg:items-end w-full mt-4 lg:mt-0"
                    }
                >
                    <PriceText className="min-w-0 overflow-hidden text-ellipsis">
                        {item.price ?? "Preis unbekannt"}
                    </PriceText>

                    <div className={"flex flex-col gap-2 lg:items-end flex-shrink-0 lg:ml-2"}>
                        <Button variant={"default"} asChild>
                            <Link
                                to="/item/$shopId/$shopsItemId"
                                params={{
                                    shopId: item.shopId,
                                    shopsItemId: item.shopsItemId,
                                }}
                            >
                                <Eye />
                                <span>Details</span>
                            </Link>
                        </Button>
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
