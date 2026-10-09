import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminListingSourceSummary } from "@/data/internal/listing-source/AdminListingSource.ts";
import { useAdminAuctionListingSources } from "../api/useAdminAuctions.ts";

const SEARCH_DEBOUNCE_MS = 350;

export function AuctionListingSourcePicker({
    value,
    onChange,
    error,
}: {
    readonly value: AdminListingSourceSummary | undefined;
    readonly onChange: (source: AdminListingSourceSummary | undefined) => void;
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
        <fieldset className="grid gap-3">
            <legend className="mb-3 font-medium">{t("adminAuctions.fields.listingSource")}</legend>
            {value ? (
                <div className="flex items-start justify-between gap-4 border bg-surface-container-low p-4">
                    <ListingSourceDescription source={value} />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => {
                            onChange(undefined);
                            setFocusSearch(true);
                        }}
                    >
                        <X aria-hidden="true" />
                        {t("adminAuctions.actions.clearSource")}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="auction-source-search">
                            {t("adminAuctions.fields.searchListingSources")}
                        </Label>
                        <Input
                            ref={searchInput}
                            id="auction-source-search"
                            type="search"
                            autoComplete="off"
                            spellCheck={false}
                            aria-describedby="auction-source-search-hint"
                            value={search}
                            onChange={(event) => setSearch(event.currentTarget.value)}
                        />
                        <p
                            id="auction-source-search-hint"
                            className="text-sm text-muted-foreground"
                        >
                            {t("adminAuctions.sourceSearch.prompt")}
                        </p>
                    </div>
                    {search.trim() !== "" && (
                        <ListingSourceResults
                            search={search.trim()}
                            debouncedSearch={debouncedSearch}
                            onSelect={onChange}
                        />
                    )}
                </>
            )}
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {t(error)}
                </p>
            )}
        </fieldset>
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
            <p role="status" className="text-sm text-muted-foreground">
                {t("adminAuctions.sourceSearch.loading")}
            </p>
        );
    }
    if (sourceSearch.error) {
        return (
            <div className="grid justify-items-start gap-2" role="alert">
                <p className="text-sm text-destructive">{sourceSearch.error.message}</p>
                <Button type="button" variant="outline" onClick={() => sourceSearch.refetch()}>
                    {t("adminAuctions.actions.retry")}
                </Button>
            </div>
        );
    }
    if (sources.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {t("adminAuctions.sourceSearch.noResults")}
            </p>
        );
    }
    return (
        <>
            <ul className="grid gap-2" aria-label={t("adminAuctions.sourceSearch.results")}>
                {sources.map((source) => (
                    <li key={source.listingSourceId}>
                        <button
                            type="button"
                            className="w-full border bg-surface-container-low p-3 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => onSelect(source)}
                        >
                            <ListingSourceDescription source={source} />
                        </button>
                    </li>
                ))}
            </ul>
            {sourceSearch.hasNextPage && (
                <Button
                    type="button"
                    variant="outline"
                    className="justify-self-center"
                    disabled={sourceSearch.isFetchingNextPage}
                    onClick={() => sourceSearch.fetchNextPage()}
                >
                    {sourceSearch.isFetchingNextPage
                        ? t("adminAuctions.actions.loadingMore")
                        : t("adminAuctions.actions.loadMore")}
                </Button>
            )}
        </>
    );
}

/** Shows the operator too, because text searches also match operator names and slugs. */
function ListingSourceDescription({ source }: { readonly source: AdminListingSourceSummary }) {
    const { t } = useTranslation();
    return (
        <span className="grid min-w-0 gap-1">
            <span className="font-medium">{source.name}</span>
            <span className="text-sm text-muted-foreground">
                {t("adminAuctions.sourceSearch.operatedBy", { name: source.operator.name })}
            </span>
            <span className="break-all font-mono text-xs text-muted-foreground">
                {source.listingSourceId} · {source.listingSourceSlugId}
            </span>
        </span>
    );
}
