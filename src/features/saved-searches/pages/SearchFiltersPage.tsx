import { Link } from "@tanstack/react-router";
import { Bell, Pause, Plus, Search, TriangleAlert, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import {
    SEARCH_FILTER_QUOTA,
    SUBSCRIPTION_TYPE_TRANSLATION_KEYS,
} from "@/data/internal/account/SubscriptionType.ts";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import { env } from "@/env.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { useUserSearchFilters } from "@/features/saved-searches/api/useUserSearchFilters.ts";
import { CreateSearchFilterWizard } from "@/features/saved-searches/components/CreateSearchFilterWizard.tsx";
import {
    SearchFilterCard,
    SearchFilterRestingRow,
} from "@/features/saved-searches/components/SearchFilterCard.tsx";
import {
    SearchFilterCardSkeleton,
    SearchFilterRowSkeleton,
} from "@/features/saved-searches/components/SearchFilterCardSkeleton.tsx";
import {
    FOCUS_CLASS,
    MONO_LABEL_CLASS,
    PAGE_COLUMN_CLASS,
    PRIMARY_PILL_CLASS,
    SECTION_HEADING_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { cn } from "@/lib/utils.ts";

type WizardState = {
    readonly open: boolean;
    readonly mode: "create" | "edit" | "duplicate";
    readonly filter?: UserSearchFilter;
};

const SKELETON_IDS = ["s1", "s2"] as const;
const CARD_GRID_CLASS = "grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2";

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export function SearchFiltersPage() {
    const { t } = useTranslation();
    const { data, isPending, error, refetch } = useUserSearchFilters();
    const { data: account, isPending: isAccountPending } = useUserAccount();
    const [query, setQuery] = useState("");
    const [wizard, setWizard] = useState<WizardState>({ open: false, mode: "create" });

    const items = data?.items ?? [];
    const total = data?.total ?? data?.size ?? items.length;
    const quota = account ? SEARCH_FILTER_QUOTA[account.subscriptionType] : 0;
    const canCreate = !isAccountPending && !isPending && account != null && total < quota;

    const trimmedQuery = query.trim().toLowerCase();
    const filtered = trimmedQuery
        ? items.filter((filter) => filter.name.toLowerCase().includes(trimmedQuery))
        : items;
    const watching = filtered.filter((filter) => filter.state === "ACTIVE");
    const resting = filtered.filter((filter) => filter.state !== "ACTIVE");

    const openWizard = (mode: WizardState["mode"], filter?: UserSearchFilter) =>
        setWizard({ open: true, mode, filter });
    const cardProps = {
        canDuplicate: canCreate,
        onEdit: (filter: UserSearchFilter) => openWizard("edit", filter),
        onDuplicate: (filter: UserSearchFilter) => openWizard("duplicate", filter),
    };

    const createButton = (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex w-full sm:w-auto">
                    <button
                        type="button"
                        disabled={!canCreate}
                        onClick={() => openWizard("create")}
                        className={cn(
                            PRIMARY_PILL_CLASS,
                            "h-12 w-full pr-5 pl-4 sm:h-11 sm:w-auto",
                        )}
                    >
                        <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                        {t("searchFilters.createCta")}
                    </button>
                </span>
            </TooltipTrigger>
            {!canCreate && !isAccountPending && !isPending && (
                <TooltipContent>{t("searchFilters.createUpgradeTooltip")}</TooltipContent>
            )}
        </Tooltip>
    );

    let content: ReactNode;
    if (isPending) {
        content = (
            <div role="status" aria-busy="true">
                <span className="sr-only">{t("searchFilters.loading")}</span>
                <WatchingBand count={null}>
                    <div className={CARD_GRID_CLASS}>
                        {SKELETON_IDS.map((id) => (
                            <SearchFilterCardSkeleton key={id} />
                        ))}
                    </div>
                </WatchingBand>
                <div className={cn(PAGE_COLUMN_CLASS, "pt-9 pb-24 sm:pt-14 sm:pb-36")}>
                    <div className="border-t border-line">
                        {SKELETON_IDS.map((id) => (
                            <SearchFilterRowSkeleton key={id} />
                        ))}
                    </div>
                </div>
            </div>
        );
    } else if (error) {
        content = (
            <div className={cn(PAGE_COLUMN_CLASS, "pb-24")}>
                <ResultStatePanel
                    alert
                    icon={
                        <span
                            aria-hidden="true"
                            className="inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                        >
                            <TriangleAlert className="size-[22px]" strokeWidth={1.8} />
                        </span>
                    }
                    title={
                        <Trans
                            i18nKey="searchFilters.loadingError.headline"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                    description={t("searchFilters.loadingError.description")}
                >
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className={RESULT_SECONDARY_BUTTON_CLASS}
                    >
                        {t("searchFilters.loadingError.retry")}
                    </button>
                </ResultStatePanel>
            </div>
        );
    } else if (items.length === 0) {
        content = (
            <div className={cn(PAGE_COLUMN_CLASS, "pb-24")}>
                <ResultStatePanel
                    icon={
                        <span
                            aria-hidden="true"
                            className="inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                        >
                            <Bell className="size-[22px]" strokeWidth={1.7} />
                        </span>
                    }
                    title={
                        <Trans
                            i18nKey="searchFilters.noResults.headline"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                    description={t("searchFilters.noResults.description")}
                >
                    {(canCreate || isAccountPending) && (
                        <button
                            type="button"
                            disabled={!canCreate}
                            onClick={() => openWizard("create")}
                            className={cn(PRIMARY_PILL_CLASS, "pr-5 pl-4")}
                        >
                            <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                            {t("searchFilters.createCta")}
                        </button>
                    )}
                    {isSearchEnabled && (
                        <Link
                            to="/$lng/search"
                            params={true}
                            from="/$lng"
                            className={RESULT_SECONDARY_BUTTON_CLASS}
                        >
                            {t("searchFilters.noResults.searchCta")}
                        </Link>
                    )}
                </ResultStatePanel>
            </div>
        );
    } else if (filtered.length === 0) {
        content = (
            <div className={cn(PAGE_COLUMN_CLASS, "pb-24")}>
                <div className="flex flex-col items-center gap-3 border-t border-line-subtle px-4 py-16 text-center">
                    <h2 className="font-serif text-[24px] leading-[1.2] font-normal [&_em]:italic">
                        <Trans
                            i18nKey="searchFilters.noNameMatch.headline"
                            values={{ query: query.trim() }}
                            components={HEADLINE_COMPONENTS}
                        />
                    </h2>
                    <p className="text-body-sm text-ink-secondary">
                        {t("searchFilters.noNameMatch.description", { count: items.length })}
                    </p>
                    <button
                        type="button"
                        onClick={() => setQuery("")}
                        className={cn(RESULT_SECONDARY_BUTTON_CLASS, "mt-1 h-10")}
                    >
                        {t("searchFilters.noNameMatch.clear")}
                    </button>
                </div>
            </div>
        );
    } else {
        content = (
            <>
                {/* A name search that matches only resting filters hides the band instead of
                    claiming that nothing is watching. */}
                {(watching.length > 0 || !trimmedQuery) && (
                    <WatchingBand count={watching.length}>
                        {watching.length > 0 ? (
                            <div className={CARD_GRID_CLASS}>
                                {watching.map((filter) => (
                                    <SearchFilterCard
                                        key={filter.id}
                                        filter={filter}
                                        {...cardProps}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-body text-ink-secondary">
                                {t("searchFilters.watching.empty")}
                            </p>
                        )}
                    </WatchingBand>
                )}
                {(resting.length > 0 || !trimmedQuery) && (
                    <section
                        aria-labelledby="search-filters-resting"
                        className={cn(
                            PAGE_COLUMN_CLASS,
                            "flex flex-col gap-4 pt-9 pb-24 sm:gap-6 sm:pt-14 sm:pb-36",
                        )}
                    >
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                            <h2
                                id="search-filters-resting"
                                className={cn(SECTION_HEADING_CLASS, "text-[26px] sm:text-[30px]")}
                            >
                                {t("searchFilters.resting.heading")}
                            </h2>
                            {resting.length > 0 && (
                                <span className={MONO_LABEL_CLASS}>
                                    {t("searchFilters.resting.meta", { count: resting.length })}
                                </span>
                            )}
                        </div>
                        <div className="border-t border-line">
                            {resting.map((filter) => (
                                <SearchFilterRestingRow
                                    key={filter.id}
                                    filter={filter}
                                    {...cardProps}
                                />
                            ))}
                            {resting.length === 0 && (
                                <div className="flex items-center gap-4 border-b border-line py-5 sm:py-6">
                                    <span
                                        aria-hidden="true"
                                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill text-ink-muted shadow-[inset_0_0_0_1px_var(--line-strong)]"
                                    >
                                        <Pause className="size-[15px]" strokeWidth={1.8} />
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-serif text-[17px] leading-[1.25] text-ink-secondary sm:text-[19px] [&_em]:italic">
                                            <Trans
                                                i18nKey="searchFilters.resting.emptyHeadline"
                                                components={HEADLINE_COMPONENTS}
                                            />
                                        </p>
                                        <p className="text-meta text-ink-muted">
                                            {t("searchFilters.resting.empty")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {resting.length === 0 && trimmedQuery && <div className="pb-24 sm:pb-36" />}
            </>
        );
    }

    return (
        <div className="w-full">
            <header
                className={cn(
                    PAGE_COLUMN_CLASS,
                    "flex flex-col gap-6 pt-8 pb-7 sm:pt-14 sm:pb-10 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between",
                )}
            >
                <div className="flex min-w-0 max-w-[720px] flex-col gap-3 sm:gap-4">
                    <h1 className="font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] sm:text-[clamp(40px,4.6vw,68px)] sm:leading-[1.02] [&_em]:italic">
                        <Trans i18nKey="searchFilters.heading" components={HEADLINE_COMPONENTS} />
                    </h1>
                    <p className="text-body-sm text-ink-secondary sm:text-body">
                        {t("searchFilters.lead")}
                    </p>
                </div>
                {!error && (
                    <div className="flex flex-col gap-3 lg:items-end">
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                            {items.length > 0 && (
                                <label className="flex h-12 items-center gap-2 rounded-pill bg-surface-raised px-3.5 shadow-field focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-brass sm:h-11 sm:w-[260px]">
                                    <span className="sr-only">
                                        {t("searchFilters.searchLabel")}
                                    </span>
                                    <Search
                                        aria-hidden="true"
                                        className="size-[15px] shrink-0 text-ink-muted"
                                        strokeWidth={2}
                                    />
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder={t("searchFilters.searchPlaceholder")}
                                        className="min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-placeholder sm:text-sm [&::-webkit-search-cancel-button]:hidden"
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            aria-label={t("searchFilters.noNameMatch.clear")}
                                            onClick={() => setQuery("")}
                                            className={cn(
                                                "-mr-1.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-pill text-ink-muted",
                                                FOCUS_CLASS,
                                            )}
                                        >
                                            <X
                                                aria-hidden="true"
                                                className="size-3"
                                                strokeWidth={2.2}
                                            />
                                        </button>
                                    )}
                                </label>
                            )}
                            {createButton}
                        </div>
                        {account && Number.isFinite(quota) && !isPending && (
                            <QuotaMeter
                                used={total}
                                limit={quota}
                                plan={t(
                                    SUBSCRIPTION_TYPE_TRANSLATION_KEYS[account.subscriptionType],
                                )}
                            />
                        )}
                    </div>
                )}
            </header>

            {content}

            <CreateSearchFilterWizard
                open={wizard.open}
                onOpenChange={(open) => setWizard((current) => ({ ...current, open }))}
                mode={wizard.mode}
                filter={wizard.filter}
            />
        </div>
    );
}

function QuotaMeter({
    used,
    limit,
    plan,
}: {
    readonly used: number;
    readonly limit: number;
    readonly plan: string;
}) {
    const { t } = useTranslation();
    const share = Math.min(1, limit > 0 ? used / limit : 1);

    return (
        <span className="inline-flex items-center gap-2.5 self-center text-meta text-ink-muted sm:self-start lg:self-end">
            {t("searchFilters.quota", { used, limit, plan })}
            <span
                aria-hidden="true"
                className="flex h-1 w-12 overflow-hidden rounded-xs bg-surface-sunken sm:w-[72px]"
            >
                <span className="bg-oxblood" style={{ width: `${share * 100}%` }} />
            </span>
        </span>
    );
}

/** The full-width ink band of active search filters. `count` is null while loading. */
function WatchingBand({
    count,
    children,
}: {
    readonly count: number | null;
    readonly children: ReactNode;
}) {
    const { t } = useTranslation();

    return (
        <section
            data-theme="dark"
            aria-labelledby="search-filters-watching"
            className="bg-surface text-ink"
        >
            <div
                className={cn(
                    PAGE_COLUMN_CLASS,
                    "flex flex-col gap-6 py-9 sm:gap-9 sm:py-14 sm:pb-16",
                )}
            >
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-4">
                    <h2
                        id="search-filters-watching"
                        className={cn(
                            SECTION_HEADING_CLASS,
                            "inline-flex items-center gap-3 text-[30px] leading-[1.1] sm:gap-4 sm:text-[40px] [&_em]:text-brass-light",
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className="size-[9px] shrink-0 animate-live-pulse rounded-pill bg-signal-live motion-reduce:animate-none sm:size-2.5"
                        />
                        <span>
                            <Trans
                                i18nKey="searchFilters.watching.heading"
                                components={HEADLINE_COMPONENTS}
                            />
                        </span>
                    </h2>
                    {count != null && (
                        <span className={cn(MONO_LABEL_CLASS, "text-tag sm:text-kicker")}>
                            {t("searchFilters.watching.meta", { count })}
                        </span>
                    )}
                </div>
                {children}
            </div>
        </section>
    );
}
