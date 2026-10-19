import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

/** Loading stand-in shaped like a result card. */
export function SearchResultCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            data-testid="search-result-skeleton"
            className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none"
        >
            <div className="aspect-square rounded-md bg-image-ground" />
            <div className="h-2.5 w-[45%] rounded-xs bg-surface-sunken" />
            <div className="h-3.5 w-[92%] rounded-xs bg-surface-sunken" />
            <div className="h-3.5 w-[70%] rounded-xs bg-surface-sunken" />
            <div className="flex justify-between">
                <div className="h-3 w-[30%] rounded-xs bg-surface-sunken" />
                <div className="h-3 w-[22%] rounded-xs bg-surface-sunken" />
            </div>
        </div>
    );
}

/** A match over the viewer's monthly quota, shown in its place in the grid. */
export function SearchHiddenMatchCard() {
    const { t } = useTranslation();

    return (
        <article
            aria-label={t("search.hiddenMatch.label")}
            className="flex h-full min-w-0 flex-col gap-3 text-ink"
        >
            <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-md bg-surface-sunken p-6 text-center shadow-ring">
                <span
                    aria-hidden="true"
                    className="inline-flex size-12 items-center justify-center rounded-pill bg-surface-raised text-oxblood shadow-ring"
                >
                    <Lock className="size-5" strokeWidth={1.8} />
                </span>
                <span className="font-mono text-tag tracking-[0.14em] text-ink-muted uppercase">
                    {t("search.hiddenMatch.label")}
                </span>
            </div>
            <div className="flex flex-col gap-1.5">
                <h3 className="font-serif text-[15px] leading-[1.25] font-normal sm:text-[17px]">
                    {t("search.hiddenMatch.title")}
                </h3>
                <p className="text-meta text-ink-secondary">
                    {t("search.hiddenMatch.description")}
                </p>
            </div>
            <div className="mt-auto flex border-t border-line-subtle">
                <Link
                    to="/$lng"
                    hash="pricing"
                    params={true}
                    from="/$lng"
                    className={cn(
                        "inline-flex min-h-11 items-center gap-1.5 text-meta font-medium text-oxblood hover:text-brass-ink",
                        "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass",
                    )}
                >
                    {t("searchFilter.upgradeNow")}
                    <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                </Link>
            </div>
        </article>
    );
}
