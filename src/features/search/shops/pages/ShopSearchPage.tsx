import { H1 } from "@/components/typography/H1.tsx";
import { ShopSearchResults } from "@/features/search/shops/components/ShopSearchResults.tsx";
import { ScrollToTopButton } from "@/features/search/common/components/ScrollToTopButton.tsx";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { useTranslation } from "react-i18next";

type ShopSearchPageProps = {
    readonly searchArgs: ShopSearchFilterArguments;
};

export function ShopSearchPage({ searchArgs }: ShopSearchPageProps) {
    const { t } = useTranslation();

    return (
        <>
            <div className="bg-background">
                <div className="mx-auto max-w-7xl">
                    <div className="bg-surface-container-low px-6 py-8 sm:px-8 lg:px-10">
                        <div className="min-w-0">
                            <div className="flex flex-col gap-4 pb-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-end gap-3">
                                        <H1 className="wrap-break-word text-4xl sm:text-5xl">
                                            {searchArgs.q
                                                ? `${t("search.shopResultsFor")} “${searchArgs.q}”`
                                                : t("search.publicSourcesBrowseTitle")}
                                        </H1>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 min-w-0">
                                <ShopSearchResults searchFilters={searchArgs} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ScrollToTopButton />
        </>
    );
}
