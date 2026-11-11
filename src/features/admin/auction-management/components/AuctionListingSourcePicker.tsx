import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import {
    ADMIN_PANEL_CLASS,
    ADMIN_ROW_ACTION_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { PickerState } from "@/features/admin/product-listing-management/components/AdminPickerState.tsx";
import type { AdminListingSourceSummary } from "@/data/internal/listing-source/AdminListingSource.ts";
import { cn } from "@/lib/utils.ts";
import { useAdminAuctionListingSources } from "../api/useAdminAuctions.ts";

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Chooses the auction's listing source (board "Admin · States", pickers): a search over names,
 * slugs and IDs with selectable results; the choice shows as a ringed card with Clear selection.
 */
export function AuctionListingSourcePicker({
    value,
    onChange,
    error,
}: {
    readonly value: AdminListingSourceSummary | undefined;
    readonly onChange: (source: AdminListingSourceSummary | undefined) => void;
    /** A translation key. */
    readonly error?: string;
}) {
    const { t } = useTranslation();
    const searchInput = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search.trim(), SEARCH_DEBOUNCE_MS);
    const [focusSearch, setFocusSearch] = useState(false);

    useEffect(() => {
        if (focusSearch && !value) {
            searchInput.current?.focus();
            setFocusSearch(false);
        }
    }, [focusSearch, value]);

    return (
        <div className="flex flex-col gap-2">
            <span
                id="auction-source-label"
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {t("adminAuctions.fields.source")}
            </span>
            {value ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-raised px-3.5 py-3 shadow-[inset_0_0_0_1.5px_var(--ink)]">
                    <ListingSourceDescription source={value} />
                    <button
                        type="button"
                        onClick={() => {
                            onChange(undefined);
                            setFocusSearch(true);
                        }}
                        className={cn(
                            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-pill px-3 text-meta font-medium hover:bg-surface-sunken",
                            FOCUS_CLASS,
                        )}
                    >
                        <X aria-hidden="true" className="size-[13px]" strokeWidth={1.9} />
                        {t("adminAuctions.actions.clearSource")}
                    </button>
                </div>
            ) : (
                <div className={cn(ADMIN_PANEL_CLASS, "flex flex-col gap-4 p-5 sm:p-6")}>
                    <div className="relative">
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute top-[13px] left-3.5 size-[17px] text-ink-muted"
                            strokeWidth={1.8}
                        />
                        <input
                            ref={searchInput}
                            id="auction-source-search"
                            type="search"
                            autoComplete="off"
                            spellCheck={false}
                            aria-label={t("adminAuctions.sourceSearch.label")}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? "auction-source-error" : undefined}
                            placeholder={t("adminAuctions.sourceSearch.placeholder")}
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                            className={cn(FIELD_CLASS, "pl-[42px]")}
                        />
                    </div>
                    {search.trim() !== "" && (
                        <ListingSourceResults
                            search={search.trim()}
                            debouncedSearch={debouncedSearch}
                            onSelect={onChange}
                        />
                    )}
                </div>
            )}
            {error && (
                <p id="auction-source-error" className={FIELD_ERROR_CLASS}>
                    {t(error)}
                </p>
            )}
        </div>
    );
}

function ListingSourceResults({
    search,
    debouncedSearch,
    onSelect,
}: {
    readonly search: string;
    readonly debouncedSearch: string;
    readonly onSelect: (source: AdminListingSourceSummary) => void;
}) {
    const { t } = useTranslation();
    const sourceSearch = useAdminAuctionListingSources(debouncedSearch);
    const sources = sourceSearch.data?.pages.flatMap((page) => page.items) ?? [];

    // Results for an older search term must never be offered for the current one.
    if (sourceSearch.isPending || debouncedSearch !== search) {
        return (
            <PickerState>
                <Loader2
                    aria-hidden="true"
                    className="size-[15px] animate-spin motion-reduce:animate-none"
                />
                {t("adminAuctions.sourceSearch.searching")}
            </PickerState>
        );
    }
    if (sourceSearch.error) {
        return (
            <PickerState
                error
                action={
                    <button
                        type="button"
                        onClick={() => sourceSearch.refetch()}
                        className={ADMIN_ROW_ACTION_CLASS}
                    >
                        {t("adminCommon.retry")}
                    </button>
                }
            >
                {sourceSearch.error.message}
            </PickerState>
        );
    }
    if (sources.length === 0) {
        return <PickerState>{t("adminAuctions.sourceSearch.none")}</PickerState>;
    }
    return (
        <>
            <ul
                aria-label={t("adminAuctions.sourceSearch.matches")}
                className="border-t border-line"
            >
                {sources.map((source) => (
                    <li key={source.listingSourceId}>
                        <button
                            type="button"
                            onClick={() => onSelect(source)}
                            className={cn(
                                "flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-3 border-b border-line-subtle px-2 py-2.5 text-left hover:bg-surface-sunken",
                                FOCUS_CLASS,
                            )}
                        >
                            <ListingSourceDescription source={source} />
                            <span
                                aria-hidden="true"
                                className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase"
                            >
                                {t("adminAuctions.sourceSearch.select")}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
            {sourceSearch.hasNextPage && (
                <button
                    type="button"
                    disabled={sourceSearch.isFetchingNextPage}
                    onClick={() => sourceSearch.fetchNextPage()}
                    className={cn(SMALL_SECONDARY_PILL_CLASS, "self-center")}
                >
                    {sourceSearch.isFetchingNextPage
                        ? t("adminCommon.loading")
                        : t("adminAuctions.sourceSearch.loadMore")}
                </button>
            )}
        </>
    );
}

/** Shows the operator too, because text searches also match operator names and slugs. */
function ListingSourceDescription({ source }: { readonly source: AdminListingSourceSummary }) {
    const { t } = useTranslation();
    return (
        <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium break-words">{source.name}</span>
            <span className="text-xs text-ink-secondary">
                {t("adminAuctions.sourceSearch.operatedBy", { name: source.operator.name })} ·{" "}
                <code className="font-mono text-[11px] break-all">
                    {source.listingSourceId} · {source.listingSourceSlugId}
                </code>
            </span>
        </span>
    );
}
