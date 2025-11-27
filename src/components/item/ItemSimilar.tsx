import { useSimilarItems } from "@/hooks/useSimiliarItems.ts";
import { ItemSimilarCard } from "@/components/item/ItemSimilarCard.tsx";
import { Card } from "@/components/ui/card.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import { useTranslation } from "react-i18next";
import { AlertCircle, SearchX, RefreshCw } from "lucide-react";

interface ItemSimilarProps {
    readonly shopId: string;
    readonly shopsItemId: string;
}

export function ItemSimilar({ shopId, shopsItemId }: ItemSimilarProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError, error } = useSimilarItems(shopId, shopsItemId);

    if (isLoading) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>{t("item.similar.title")}</H2>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>{t("item.similar.title")}</H2>
                <div className="flex flex-col items-center gap-4 py-16">
                    <AlertCircle className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <H3>{t("item.similar.error.title")}</H3>
                        <p className="text-base text-muted-foreground">
                            {error?.message ?? t("item.similar.error.description")}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (data?.isEmbeddingsPending) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>{t("item.similar.title")}</H2>
                <div className="flex flex-col items-center gap-4 py-16">
                    <RefreshCw className="h-16 w-16 text-muted-foreground animate-[spin_2s_linear_infinite]" />
                    <div className="text-center space-y-2">
                        <H3>{t("item.similar.embeddingsPending.title")}</H3>
                        <p className="text-base text-muted-foreground">
                            {t("item.similar.embeddingsPending.description")}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>{t("item.similar.title")}</H2>
                <div className="flex flex-col items-center gap-4 py-16">
                    <SearchX className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <H3>{t("item.similar.noData.title")}</H3>
                        <p className="text-base text-muted-foreground">
                            {t("item.similar.noData.description")}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col py-8 md:p-8 gap-4 shadow-md min-w-0">
            <div className="relative md:px-12">
                <Carousel
                    opts={{
                        align: "center",
                        containScroll: "trimSnaps",
                    }}
                    className="w-full"
                >
                    <div className="flex justify-between items-center mb-4 px-8 md:px-0">
                        <H2>{t("item.similar.title")}</H2>

                        <div className="flex gap-2 md:hidden">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </div>

                    <CarouselContent className="pb-4">
                        {data.items.map((item) => (
                            <CarouselItem
                                key={item.itemId}
                                className="pl-4 first:pl-12 md:first:pl-4 last:pr-8 md:last:pr-0 basis-[calc(100vw-80px)] md:basis-1/2 xl:basis-1/3"
                            >
                                <ItemSimilarCard item={item} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </Card>
    );
}
