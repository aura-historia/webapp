import { StatusBadge } from "@/components/item/StatusBadge.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import type { OverviewItem } from "@/data/internal/OverviewItem.ts";
import { HeartIcon, Image } from "lucide-react";
import type React from "react";
import { H3 } from "../typography/H3";

export function ItemCard({ item, key }: { item: OverviewItem; key: React.Key }) {
    return (
        <Card key={key} className={"flex flex-row p-8 gap-4"}>
            <div className={"flex-shrink-0"}>
                {item.images.length > 0 ? (
                    <img
                        className={"size-48 object-cover rounded-lg"}
                        src={item.images[0].href}
                        alt=""
                    />
                ) : (
                    <Image className={"size-48 object-contain rounded-lg"} />
                )}
            </div>
            <div className={"flex flex-col min-w-0"}>
                <div className={"flex flex-row"}>
                    <div className={"flex flex-col gap-2"}>
                        <H2 className={"text-ellipsis overflow-hidden line-clamp-1"}>
                            {item.title}
                        </H2>
                        <H3 variant={"muted"}>{item.shopName}</H3>
                        <StatusBadge status={item.state} />
                    </div>
                    <div>
                        <Button variant={"ghost"} size={"icon"} className={"ml-auto hover:bg-none"}>
                            <HeartIcon />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
