import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Pause, Play } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ToggleBellIcon } from "@/components/common/ToggleBellIcon.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";
import { useUpdateUserSearchFilter } from "@/features/saved-searches/api/useUpdateUserSearchFilter.ts";
import { DeleteSearchFilterDialog } from "@/features/saved-searches/components/DeleteSearchFilterDialog.tsx";
import { SearchFilterActionsMenu } from "@/features/saved-searches/components/SearchFilterActionsMenu.tsx";
import {
    getQueryTerms,
    useSearchFilterCriteria,
} from "@/features/saved-searches/hooks/useSearchFilterCriteria.ts";
import {
    FOCUS_CLASS,
    GHOST_PILL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly filter: UserSearchFilter;
    readonly canDuplicate: boolean;
    readonly onEdit: (filter: UserSearchFilter) => void;
    readonly onDuplicate: (filter: UserSearchFilter) => void;
};

function formatTerms(terms: readonly string[]) {
    return terms.map((term) => `“${term}”`).join(" · ");
}

function FilterNameLink({
    filter,
    className,
}: {
    readonly filter: UserSearchFilter;
    readonly className: string;
}) {
    return (
        <Link
            to="/$lng/me/search-filter/$filterId"
            params={(current) => ({ ...current, filterId: filter.id })}
            from="/$lng"
            className={cn("group min-w-0 self-start rounded-xs", FOCUS_CLASS)}
        >
            <h3
                id={`search-filter-${filter.id}`}
                className={cn(
                    "font-serif font-normal group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4",
                    className,
                )}
            >
                {filter.name}
            </h3>
        </Link>
    );
}

/**
 * An active search filter on the ink "Watching now" band: live label, name, search terms,
 * criteria, the email-alert toggle and the way to its matches.
 */
export function SearchFilterCard({ filter, canDuplicate, onEdit, onDuplicate }: Props) {
    const { t } = useTranslation();
    const updateFilter = useUpdateUserSearchFilter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const criteria = useSearchFilterCriteria(filter.search);
    const terms = getQueryTerms(filter.search);

    return (
        <article
            aria-labelledby={`search-filter-${filter.id}`}
            className="flex h-full min-w-0 flex-col gap-5 rounded-card bg-surface-raised px-5 pt-[22px] pb-2.5 text-ink shadow-ring sm:px-7 sm:pt-7 sm:pb-3"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2">
                    <span className="inline-flex items-center gap-2 font-mono text-kicker tracking-[0.14em] text-signal-live uppercase">
                        <span
                            aria-hidden="true"
                            className="size-[7px] rounded-pill bg-signal-live"
                        />
                        {t("searchFilters.state.live")}
                    </span>
                    <FilterNameLink
                        filter={filter}
                        className="text-[24px] leading-[1.12] tracking-[-0.01em] sm:text-[30px]"
                    />
                    {terms.length > 0 && (
                        <p className="font-serif text-base leading-[1.4] text-brass-light italic">
                            {formatTerms(terms)}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    aria-label={t("searchFilters.pauseFilter", { name: filter.name })}
                    disabled={updateFilter.isPending}
                    onClick={() =>
                        updateFilter.mutate({ id: filter.id, patch: { state: "INACTIVE_BY_USER" } })
                    }
                    className={cn(SECONDARY_PILL_CLASS, "h-10 px-3 text-[13px] sm:pr-3.5 sm:pl-3")}
                >
                    <Pause aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    <span className="hidden sm:inline">{t("searchFilters.deactivate")}</span>
                </button>
            </div>

            {filter.enhancedSearchDescription && (
                <p className="line-clamp-2 text-meta leading-[1.55] text-ink-secondary">
                    <span className="mr-1.5 font-mono text-tag tracking-[0.14em] text-brass-light">
                        {t("searchFilters.aiLabel")}
                    </span>
                    {filter.enhancedSearchDescription}
                </p>
            )}

            <p className="font-mono text-[11px] leading-[1.8] tracking-[0.06em] text-ink-secondary uppercase">
                {criteria.map((criterion) => criterion.values.join(", ")).join(" · ")}
            </p>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-subtle pt-1">
                <button
                    type="button"
                    aria-pressed={filter.notifications}
                    disabled={updateFilter.isPending}
                    onClick={() =>
                        updateFilter.mutate({
                            id: filter.id,
                            patch: { notifications: !filter.notifications },
                        })
                    }
                    className={cn(
                        GHOST_PILL_CLASS,
                        "-ml-2.5 h-10 px-2.5 text-[13px] font-normal",
                        filter.notifications ? "text-ink" : "text-ink-muted",
                    )}
                >
                    <ToggleBellIcon
                        on={filter.notifications}
                        className="size-[15px]"
                        strokeWidth={1.7}
                    />
                    {filter.notifications
                        ? t("searchFilters.emailAlertsOn")
                        : t("searchFilters.emailAlertsOff")}
                </button>
                <div className="flex items-center gap-1">
                    <Link
                        to="/$lng/me/search-filter/$filterId"
                        params={(current) => ({ ...current, filterId: filter.id })}
                        from="/$lng"
                        className={cn(
                            "inline-flex min-h-11 items-center gap-1.5 rounded-xs px-2 text-sm font-medium hover:text-brass-light",
                            FOCUS_CLASS,
                        )}
                    >
                        <span className="sm:hidden">
                            {t("searchFilters.matchesAndDetailsShort")}
                        </span>
                        <span className="hidden sm:inline">
                            {t("searchFilters.matchesAndDetails")}
                        </span>
                        <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    </Link>
                    <SearchFilterActionsMenu
                        className="-mr-3"
                        canDuplicate={canDuplicate}
                        onEdit={() => onEdit(filter)}
                        onDuplicate={() => onDuplicate(filter)}
                        onDelete={() => setDeleteOpen(true)}
                    />
                </div>
            </div>

            <DeleteSearchFilterDialog
                filterId={filter.id}
                filterName={filter.name}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </article>
    );
}

/**
 * A paused or plan-locked search filter in the "Resting" list: why it is not watching, and how
 * to resume it.
 */
export function SearchFilterRestingRow({ filter, canDuplicate, onEdit, onDuplicate }: Props) {
    const { t } = useTranslation();
    const updateFilter = useUpdateUserSearchFilter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const terms = getQueryTerms(filter.search);
    const locked = filter.state === "INACTIVE_BY_RESTRICTED_PLAN";

    return (
        <article
            aria-labelledby={`search-filter-${filter.id}`}
            className="grid grid-cols-1 gap-2.5 border-b border-line py-[18px] text-ink lg:grid-cols-[170px_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
            <span
                className={cn(
                    "inline-flex items-center gap-2 font-mono text-kicker tracking-[0.14em] uppercase",
                    locked ? "text-oxblood" : "text-ink-muted",
                )}
            >
                {locked ? (
                    <Lock aria-hidden="true" className="size-3.5" strokeWidth={2} />
                ) : (
                    <Pause aria-hidden="true" className="size-3.5" strokeWidth={2} />
                )}
                {locked ? t("searchFilters.state.locked") : t("searchFilters.state.paused")}
            </span>
            <div className="flex min-w-0 flex-col gap-1">
                <FilterNameLink
                    filter={filter}
                    className="truncate text-[21px] leading-[1.2] text-ink-secondary"
                />
                {terms.length > 0 && (
                    <span className="truncate font-serif text-sm text-ink-muted italic">
                        {formatTerms(terms)}
                    </span>
                )}
            </div>
            <p className="text-meta leading-[1.5] text-ink-muted">
                {locked ? t("searchFilters.lockedNote") : t("searchFilters.pausedNote")}
            </p>
            <div className="flex items-center justify-between gap-1 lg:justify-end">
                {locked ? (
                    <Link
                        to="/$lng"
                        hash="pricing"
                        params={true}
                        from="/$lng"
                        className={cn(
                            PRIMARY_PILL_CLASS,
                            "h-10 bg-oxblood px-4 text-[13px] text-on-oxblood",
                        )}
                    >
                        {t("searchFilters.upgradeToResume")}
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled={updateFilter.isPending}
                        onClick={() =>
                            updateFilter.mutate({ id: filter.id, patch: { state: "ACTIVE" } })
                        }
                        className={cn(PRIMARY_PILL_CLASS, "h-10 pr-4 pl-3 text-[13px]")}
                    >
                        <Play aria-hidden="true" className="size-[13px]" strokeWidth={1.8} />
                        {t("searchFilters.resume")}
                    </button>
                )}
                <SearchFilterActionsMenu
                    canDuplicate={canDuplicate}
                    onEdit={() => onEdit(filter)}
                    onDuplicate={() => onDuplicate(filter)}
                    onDelete={() => setDeleteOpen(true)}
                />
            </div>

            <DeleteSearchFilterDialog
                filterId={filter.id}
                filterName={filter.name}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
            />
        </article>
    );
}
