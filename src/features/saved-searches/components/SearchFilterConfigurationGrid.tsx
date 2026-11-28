import { useTranslation } from "react-i18next";
import type {
    GeographicSearch,
    UnsupportedGeography,
} from "@/data/internal/geography/GeographicSearch.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    getQueryTerms,
    useSearchFilterCriteria,
} from "@/features/saved-searches/hooks/useSearchFilterCriteria.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly search: SearchFilterArguments;
    readonly enhancedSearchDescription?: string;
    readonly geography?: GeographicSearch | UnsupportedGeography;
};

const ROW_CLASS = "flex flex-col gap-2 border-b border-line-subtle py-4";
const TERM_CLASS = "font-mono text-tag tracking-[0.14em] text-ink-muted uppercase";
const CHIP_CLASS = "rounded-sm px-2 py-1 text-meta";

/**
 * Every criterion of a saved search filter as ruled label/value rows in a raised card, for the
 * detail page's ink band. Search terms and the AI description span both columns.
 */
export function SearchFilterConfigurationGrid({
    search,
    enhancedSearchDescription,
    geography,
}: Props) {
    const { t } = useTranslation();
    const terms = getQueryTerms(search);
    const criteria = useSearchFilterCriteria(search, search.availability, { geography });

    return (
        <div className="min-w-0 rounded-panel bg-surface-raised px-[18px] pt-1 pb-2 text-ink shadow-ring sm:px-7 sm:pt-2 sm:pb-3">
            <dl className="grid grid-cols-1 gap-x-7 sm:grid-cols-2">
                {terms.length > 0 && (
                    <div className={cn(ROW_CLASS, "sm:col-span-2")}>
                        <dt className={TERM_CLASS}>
                            {t("searchFilter.saveDialog.queryLabel", { count: terms.length })}
                        </dt>
                        <dd className="flex flex-wrap gap-1.5">
                            {terms.map((term) => (
                                <span
                                    key={term}
                                    className={cn(
                                        CHIP_CLASS,
                                        "bg-surface-sunken font-serif text-[15px] italic",
                                    )}
                                >
                                    “{term}”
                                </span>
                            ))}
                        </dd>
                    </div>
                )}
                {enhancedSearchDescription && (
                    <div className={cn(ROW_CLASS, "sm:col-span-2")}>
                        <dt className={TERM_CLASS}>{t("searchFilter.saveDialog.aiDescription")}</dt>
                        <dd className="text-body-sm text-ink-secondary">
                            {enhancedSearchDescription}
                        </dd>
                    </div>
                )}
                {criteria.map((criterion) => (
                    <div
                        key={criterion.id}
                        className={cn(ROW_CLASS, criterion.id === "location" && "sm:col-span-2")}
                    >
                        <dt className={TERM_CLASS}>{criterion.label}</dt>
                        <dd className="flex flex-wrap gap-1.5">
                            {criterion.values.map((value) => (
                                <span
                                    key={value}
                                    className={cn(
                                        CHIP_CLASS,
                                        criterion.id === "exclude"
                                            ? "shadow-[inset_0_0_0_1px_var(--line-strong)] line-through decoration-ink-muted"
                                            : "bg-surface-sunken",
                                    )}
                                >
                                    {value}
                                </span>
                            ))}
                        </dd>
                        {criterion.note && (
                            <p className="text-xs leading-[1.5] text-ink-muted">{criterion.note}</p>
                        )}
                    </div>
                ))}
            </dl>
        </div>
    );
}
