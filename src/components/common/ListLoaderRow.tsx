import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { Lottie, type LottieHandle } from "lottie-react";
import tick from "@/assets/lottie/tick.json";
import { useInView } from "react-intersection-observer";

const COMPLETION_ANIMATION_DELAY_MS = 500;

type ListLoaderRowProps = {
    readonly isFetchingNextPage: boolean;
    readonly totalCount?: number;
    readonly loadingMoreKey?: string;
    readonly allLoadedKey?: string;
    readonly allLoadedFallbackKey?: string;
    readonly allLoadedValues?: Record<string, string>;
};

export function ListLoaderRow({
    isFetchingNextPage,
    totalCount,
    loadingMoreKey = "search.messages.loadingMore",
    allLoadedKey = "search.messages.allLoaded",
    allLoadedFallbackKey = "search.messages.allLoadedFallback",
    allLoadedValues,
}: ListLoaderRowProps) {
    const { t } = useTranslation();
    const { ref, inView } = useInView();
    const lottieRef = useRef<LottieHandle>(null);
    const hasPlayedRef = useRef(false);

    useEffect(() => {
        if (!inView || isFetchingNextPage || hasPlayedRef.current) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            if (lottieRef.current) {
                hasPlayedRef.current = true;
                lottieRef.current.play();
            }
        }, COMPLETION_ANIMATION_DELAY_MS);

        return () => window.clearTimeout(timeoutId);
    }, [inView, isFetchingNextPage]);

    return (
        <Card
            ref={ref}
            className="bg-surface-container-low border-0 p-4 flex justify-center items-center shadow-none"
        >
            <CardContent className="flex justify-center items-center w-full px-2">
                {isFetchingNextPage ? (
                    <div className="h-12 flex flex-row items-center gap-2">
                        <Spinner />
                        <SectionInfoText>{t(loadingMoreKey)}</SectionInfoText>
                    </div>
                ) : (
                    <div className="flex flex-row items-center gap-2">
                        <div className="h-12 w-12 shrink-0">
                            <Lottie src={tick} loop={false} lottieRef={lottieRef} />
                        </div>
                        <SectionInfoText>
                            {totalCount
                                ? t(allLoadedKey, { count: totalCount, ...allLoadedValues })
                                : t(allLoadedFallbackKey, allLoadedValues)}
                        </SectionInfoText>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
