import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import tick from "@/assets/lottie/tick.json";
import Lottie from "lottie-react";

type ListLoaderRowProps = {
    readonly isFetchingNextPage: boolean;
    readonly totalCount: number;
    readonly loadingMoreKey?: string;
    readonly allLoadedKey?: string;
};

export function ListLoaderRow({
    isFetchingNextPage,
    totalCount,
    loadingMoreKey = "search.messages.loadingMore",
    allLoadedKey = "search.messages.allLoaded",
}: ListLoaderRowProps) {
    const { t } = useTranslation();

    return (
        <Card className="p-4 flex justify-center items-center shadow-md">
            <CardContent className="flex justify-center items-center w-full px-2">
                {isFetchingNextPage ? (
                    <div className="flex flex-row items-center gap-2">
                        <Spinner />
                        <SectionInfoText>{t(loadingMoreKey)}</SectionInfoText>
                    </div>
                ) : (
                    <div className="flex flex-row items-center gap-2">
                        <div className="h-12 w-12 shrink-0">
                            <Lottie className="h-12 w-12" animationData={tick} loop={false} />
                        </div>
                        <SectionInfoText>{t(allLoadedKey, { count: totalCount })}</SectionInfoText>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
