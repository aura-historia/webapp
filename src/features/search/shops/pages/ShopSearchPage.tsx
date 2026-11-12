import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import type { ShopSearchFilterArguments } from "@/data/internal/search/ShopSearchFilterArguments.ts";
import { MobileAppBar } from "@/features/app-shell/components/navigation/MobileAppBar.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { ScrollToTopButton } from "@/features/search/common/components/ScrollToTopButton.tsx";
import { SearchTypeTabs } from "@/features/search/common/components/SearchTypeTabs.tsx";
import { ShopSearchResults } from "@/features/search/shops/components/ShopSearchResults.tsx";

const TEXT_LINK_CLASS =
    "inline-flex min-h-11 items-center self-start text-sm font-medium text-ink underline decoration-line-strong underline-offset-3 hover:text-brass-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

type ShopSearchPageProps = {
    readonly searchArgs: ShopSearchFilterArguments;
};

/**
 * The Providers tab of search. It mirrors the object search page: the query comes from the
 * top-bar field, the Objects / Providers tabs and the results heading sit in the same column,
 * and the filter column holds a short note, because providers are searched by name only.
 */
export function ShopSearchPage({ searchArgs }: ShopSearchPageProps) {
    const { t } = useTranslation();
    const query = searchArgs.q.trim();

    return (
        <div className="bg-surface text-ink">
            <MobileAppBar className="sticky top-15 z-40 sm:hidden" />

            <div className="mx-auto flex max-w-[1376px] items-start gap-14 px-[clamp(20px,4vw,48px)]">
                <aside
                    aria-labelledby="provider-search-filters"
                    className="sticky top-16 -ml-1.5 hidden w-[286px] shrink-0 py-10 pr-4 pl-1.5 lg:block"
                >
                    <h2
                        id="provider-search-filters"
                        className="pb-4 font-serif text-[26px] leading-[1.15] font-normal"
                    >
                        {t("search.filters")}
                    </h2>
                    <div className="flex flex-col gap-4 border-t border-line pt-5">
                        <p className="text-sm leading-[1.6] text-ink-secondary">
                            {t("search.providers.filterNote")}
                        </p>
                        <Link
                            to="/$lng/search"
                            params={true}
                            from="/$lng"
                            search={{ q: query }}
                            className={TEXT_LINK_CLASS}
                        >
                            {query
                                ? t("search.providers.searchObjectsFor", { query })
                                : t("search.providers.browseObjects")}
                        </Link>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 pt-0 pb-28 sm:pt-8 sm:pb-30">
                    <SearchTypeTabs active="providers" query={searchArgs.q} />

                    <header className="mb-7 flex min-w-0 flex-col gap-2.5 sm:mb-9 sm:gap-3">
                        <p className="font-mono text-[11px] tracking-[0.2em] text-brass-ink uppercase sm:text-eyebrow">
                            {t("search.eyebrow")}
                        </p>
                        <h1 className="font-serif text-[32px] leading-[1.08] font-normal tracking-[-0.02em] wrap-break-word sm:text-[clamp(34px,3.4vw,48px)] sm:leading-[1.06] [&_em]:italic">
                            <Trans
                                i18nKey={
                                    query ? "search.resultsForQuery" : "search.providers.resultsAll"
                                }
                                values={{ query }}
                                components={HEADLINE_COMPONENTS}
                            />
                        </h1>
                        <p className="text-body-sm text-ink-muted">
                            <span className="font-mono text-label text-ink-muted uppercase sm:text-ink">
                                {t("search.type.providers")}
                            </span>
                            <span className="hidden sm:inline">
                                {" "}
                                · {t("search.providers.hint")}
                            </span>
                        </p>
                    </header>

                    <ShopSearchResults searchFilters={searchArgs} />
                </div>
            </div>

            <div className="fixed right-5 bottom-6 z-30 sm:right-8 sm:bottom-8">
                <ScrollToTopButton />
            </div>
        </div>
    );
}
