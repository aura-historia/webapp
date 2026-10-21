import { Link, useNavigate } from "@tanstack/react-router";
import { intlFormatDistance } from "date-fns";
import { ArrowLeft, Lock, Pause, Pencil, Play, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ToggleBellIcon } from "@/components/common/ToggleBellIcon.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { useUserSearchFilter } from "@/features/saved-searches/api/useUserSearchFilter.ts";
import { useUpdateUserSearchFilter } from "@/features/saved-searches/api/useUpdateUserSearchFilter.ts";
import { CreateSearchFilterWizard } from "@/features/saved-searches/components/CreateSearchFilterWizard.tsx";
import { DeleteSearchFilterDialog } from "@/features/saved-searches/components/DeleteSearchFilterDialog.tsx";
import { SearchFilterDetailHeaderSkeleton } from "@/features/saved-searches/components/detail/SearchFilterDetailHeaderSkeleton.tsx";
import { SearchFilterMatches } from "@/features/saved-searches/components/match/SearchFilterMatches.tsx";
import { SearchFilterConfigurationGrid } from "@/features/saved-searches/components/SearchFilterConfigurationGrid.tsx";
import {
    FOCUS_CLASS,
    ICON_BUTTON_CLASS,
    PAGE_COLUMN_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
    SECTION_HEADING_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";
import {
    RESULT_SECONDARY_BUTTON_CLASS,
    ResultStatePanel,
} from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly filterId: string;
};

export function SearchFilterDetailPage({ filterId }: Props) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate({ from: "/$lng" });
    const { data: filter, isPending, error, refetch } = useUserSearchFilter(filterId);
    const updateFilter = useUpdateUserSearchFilter();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const backLink = (
        <Link
            to="/$lng/me/search-filters"
            params={true}
            from="/$lng"
            className={cn(
                "mb-3 inline-flex min-h-11 items-center gap-2 rounded-xs text-sm text-ink-muted hover:text-brass-ink",
                FOCUS_CLASS,
            )}
        >
            <ArrowLeft aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
            {t("searchFilters.detail.back")}
        </Link>
    );

    if (error) {
        return (
            <div className={cn(PAGE_COLUMN_CLASS, "pt-5 pb-24 sm:pt-8")}>
                {backLink}
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
    }

    const isActive = filter?.state === "ACTIVE";
    const isLocked = filter?.state === "INACTIVE_BY_RESTRICTED_PLAN";
    let stateLabel = t("searchFilters.state.active");
    if (filter?.state === "INACTIVE_BY_USER") stateLabel = t("searchFilters.state.paused");
    if (isLocked) stateLabel = t("searchFilters.state.locked");
    const formatAgo = (date: Date) =>
        intlFormatDistance(date, new Date(), { locale: i18n.language });

    return (
        <div className="w-full">
            {isPending && <SearchFilterDetailHeaderSkeleton />}

            {filter && (
                <>
                    <header
                        data-testid="section-configuration"
                        className={cn(
                            PAGE_COLUMN_CLASS,
                            "flex flex-col gap-6 pt-5 pb-9 sm:pt-8 sm:pb-10 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between",
                        )}
                    >
                        <div className="flex min-w-0 max-w-[820px] flex-col gap-4">
                            {backLink}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="font-mono text-eyebrow tracking-[0.2em] text-brass-ink uppercase">
                                    {t("searchFilters.detail.eyebrow")}
                                </span>
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-2 font-mono text-kicker tracking-[0.14em] uppercase",
                                        isActive && "text-ink",
                                        isLocked && "text-oxblood",
                                        !isActive && !isLocked && "text-ink-muted",
                                    )}
                                >
                                    {isLocked ? (
                                        <Lock
                                            aria-hidden="true"
                                            className="size-3.5"
                                            strokeWidth={2}
                                        />
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "size-[7px] rounded-pill border-[1.5px]",
                                                isActive
                                                    ? "border-ink bg-ink"
                                                    : "border-ink-muted bg-transparent",
                                            )}
                                        />
                                    )}
                                    {stateLabel}
                                </span>
                            </div>
                            <h1 className="font-serif text-[36px] leading-[1.04] font-normal tracking-[-0.02em] break-words sm:text-[clamp(40px,4.6vw,64px)]">
                                {filter.name}
                            </h1>
                            <p className="text-sm text-ink-muted" suppressHydrationWarning>
                                {t("searchFilters.detail.meta", {
                                    created: formatAgo(filter.created),
                                    updated: formatAgo(filter.updated),
                                })}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                aria-pressed={isActive && filter.notifications}
                                disabled={!isActive || updateFilter.isPending}
                                onClick={() =>
                                    updateFilter.mutate({
                                        id: filter.id,
                                        patch: { notifications: !filter.notifications },
                                    })
                                }
                                className={cn(SECONDARY_PILL_CLASS, "pr-4 pl-3.5")}
                            >
                                <ToggleBellIcon
                                    on={isActive && filter.notifications}
                                    className="size-4 text-oxblood"
                                    strokeWidth={1.7}
                                />
                                {isActive && filter.notifications
                                    ? t("searchFilters.emailAlertsOn")
                                    : t("searchFilters.emailAlertsOff")}
                            </button>
                            {isLocked ? (
                                <Link
                                    to="/$lng"
                                    hash="pricing"
                                    params={true}
                                    from="/$lng"
                                    className={cn(PRIMARY_PILL_CLASS, "bg-oxblood text-on-oxblood")}
                                >
                                    {t("searchFilters.upgradeToResume")}
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled={updateFilter.isPending}
                                    onClick={() =>
                                        updateFilter.mutate({
                                            id: filter.id,
                                            patch: {
                                                state: isActive ? "INACTIVE_BY_USER" : "ACTIVE",
                                            },
                                        })
                                    }
                                    className={cn(SECONDARY_PILL_CLASS, "pr-4 pl-3.5")}
                                >
                                    {isActive ? (
                                        <Pause
                                            aria-hidden="true"
                                            className="size-4"
                                            strokeWidth={1.7}
                                        />
                                    ) : (
                                        <Play
                                            aria-hidden="true"
                                            className="size-4"
                                            strokeWidth={1.7}
                                        />
                                    )}
                                    {isActive
                                        ? t("searchFilters.deactivate")
                                        : t("searchFilters.resume")}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className={cn(PRIMARY_PILL_CLASS, "pr-[18px] pl-3.5")}
                            >
                                <Pencil aria-hidden="true" className="size-4" strokeWidth={1.7} />
                                {t("searchFilters.edit")}
                            </button>
                            <button
                                type="button"
                                aria-label={t("searchFilters.delete")}
                                title={t("searchFilters.delete")}
                                onClick={() => setDeleteOpen(true)}
                                className={cn(
                                    ICON_BUTTON_CLASS,
                                    "text-oxblood shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                )}
                            >
                                <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.7} />
                            </button>
                        </div>
                    </header>

                    <section
                        data-theme="dark"
                        aria-labelledby="search-filter-criteria"
                        className="bg-surface text-ink"
                    >
                        <div
                            className={cn(
                                PAGE_COLUMN_CLASS,
                                "flex flex-wrap items-start gap-x-14 gap-y-6 pt-9 pb-10 sm:pt-14 sm:pb-16",
                            )}
                        >
                            <div className="flex max-w-[340px] flex-[1_1_260px] flex-col gap-3">
                                <h2
                                    id="search-filter-criteria"
                                    className={cn(
                                        SECTION_HEADING_CLASS,
                                        "text-[26px] sm:text-[30px]",
                                    )}
                                >
                                    {t("searchFilters.detail.configurationTitle")}
                                </h2>
                                <p className="text-body-sm text-ink-secondary">
                                    {t("searchFilters.detail.configurationHint")}
                                </p>
                            </div>
                            <div className="min-w-0 flex-[999_1_560px]">
                                <SearchFilterConfigurationGrid
                                    search={filter.search}
                                    enhancedSearchDescription={filter.enhancedSearchDescription}
                                />
                            </div>
                        </div>
                    </section>

                    <CreateSearchFilterWizard
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        mode="edit"
                        filter={filter}
                    />
                    <DeleteSearchFilterDialog
                        filterId={filter.id}
                        filterName={filter.name}
                        open={deleteOpen}
                        onOpenChange={setDeleteOpen}
                        onDeleted={() => navigate({ to: "/$lng/me/search-filters" })}
                    />
                </>
            )}

            <div className={cn(PAGE_COLUMN_CLASS, "pt-9 pb-24 sm:pt-14 sm:pb-36")}>
                <SearchFilterMatches
                    filterId={filterId}
                    onEdit={filter ? () => setEditOpen(true) : undefined}
                />
            </div>
        </div>
    );
}
