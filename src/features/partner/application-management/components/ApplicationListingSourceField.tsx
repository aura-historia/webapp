import { Search } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { ApplicationListingSource } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import {
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";
import { useApplicationListingSourceSearch } from "../api/useApplicationListingSourceSearch.ts";
import { ApplicationTile } from "./PartnerApplicationRow.tsx";

const STATE_ROW_CLASS =
    "flex min-h-13 items-center justify-between gap-3 rounded-md bg-surface px-3.5 py-3 text-body-sm shadow-ring";

/** Picks an already listed provider: search, a result list, then the chosen provider with Change. */
export function ApplicationListingSourceField({
    value,
    error,
    onChange,
}: {
    readonly value: ApplicationListingSource | null;
    readonly error?: string;
    readonly onChange: (source: ApplicationListingSource | null) => void;
}) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [query] = useDebounce(search.trim(), 350);
    const {
        data: sources = [],
        isPending,
        isError,
        refetch,
    } = useApplicationListingSourceSearch(query);

    let results: ReactNode = null;
    if (search.trim()) {
        if (isError) {
            results = (
                <div role="alert" className={cn(STATE_ROW_CLASS, "text-oxblood")}>
                    {t("partnerApplications.search.error")}
                    <button
                        type="button"
                        className={SMALL_SECONDARY_PILL_CLASS}
                        onClick={() => refetch()}
                    >
                        {t("partnerDashboard.tryAgain")}
                    </button>
                </div>
            );
        } else if (isPending || query !== search.trim()) {
            results = (
                <output className={cn(STATE_ROW_CLASS, "justify-start text-ink-secondary")}>
                    <Spinner aria-hidden="true" />
                    {t("partnerApplications.search.searching")}
                </output>
            );
        } else if (sources.length === 0) {
            results = (
                <output className={cn(STATE_ROW_CLASS, "text-ink-secondary")}>
                    {t("partnerApplications.proposals.noSources")}
                </output>
            );
        } else {
            results = (
                <ul
                    aria-label={t("partnerApplications.search.results")}
                    className="max-h-64 overflow-y-auto rounded-md bg-surface-raised shadow-ring"
                >
                    {sources.map((source) => (
                        <li key={source.listingSourceId}>
                            <button
                                type="button"
                                className={cn(
                                    "flex min-h-13 w-full cursor-pointer flex-col justify-center gap-0.5 border-b border-line-subtle px-3.5 py-2 text-left hover:bg-surface-sunken",
                                    FOCUS_CLASS,
                                )}
                                onClick={() => {
                                    onChange(source);
                                    setSearch("");
                                }}
                            >
                                <span className="text-sm font-medium">{source.name}</span>
                                <span className="text-xs text-ink-muted">
                                    {t("partnerApplications.search.operatedBy", {
                                        name: source.operatorName,
                                    })}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            );
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <label
                htmlFor="application-source-search"
                data-error={Boolean(error)}
                className={FIELD_LABEL_CLASS}
            >
                {t("partnerApplications.search.label")}
            </label>
            {value ? (
                <div className="flex items-center gap-3.5 rounded-md bg-surface px-4 py-3.5 shadow-[inset_0_0_0_1.5px_var(--oxblood)]">
                    <ApplicationTile
                        initial={value.name.trim().charAt(0).toUpperCase()}
                        className="size-10 text-lg"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[15px] font-medium">{value.name}</span>
                        <span className="truncate text-xs text-ink-muted">
                            {t("partnerApplications.search.operatedBy", {
                                name: value.operatorName,
                            })}
                        </span>
                    </span>
                    <button
                        type="button"
                        className={cn(SMALL_SECONDARY_PILL_CLASS, "h-9")}
                        onClick={() => onChange(null)}
                    >
                        {t("partnerApplications.search.change")}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div
                        className={cn(
                            "flex h-11 items-center gap-2 rounded-md bg-surface px-3 shadow-field has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass",
                            error && "shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
                        )}
                    >
                        <Search
                            aria-hidden="true"
                            className="size-[15px] shrink-0 text-ink-muted"
                            strokeWidth={2}
                        />
                        <input
                            id="application-source-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            autoComplete="off"
                            aria-invalid={Boolean(error)}
                            aria-describedby="application-source-hint"
                            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-placeholder"
                        />
                    </div>
                    {results}
                </div>
            )}
            {error && <p className={FIELD_ERROR_CLASS}>{error}</p>}
            <p id="application-source-hint" className="text-xs text-ink-muted">
                {t("partnerApplications.proposals.selectionHint")}
            </p>
        </div>
    );
}
