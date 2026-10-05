import { useState } from "react";
import type { ReactNode } from "react";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { ApplicationListingSource } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { useApplicationListingSourceSearch } from "../api/useApplicationListingSourceSearch.ts";

export function ApplicationListingSourceField({
    value,
    onChange,
}: {
    readonly value: ApplicationListingSource | null;
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
    let searchResults: ReactNode = null;
    if (search.trim()) {
        if (isError) {
            searchResults = (
                <div role="alert">
                    {t("partnerApplications.loadError")}
                    <Button type="button" onClick={() => refetch()}>
                        {t("partnerApplications.actions.retry")}
                    </Button>
                </div>
            );
        } else if (isPending || query !== search.trim()) {
            searchResults = <output>{t("partnerApplications.loading")}</output>;
        } else if (sources.length === 0) {
            searchResults = <p>{t("partnerApplications.proposals.noSources")}</p>;
        } else {
            searchResults = (
                <ul className="max-h-64 overflow-y-auto border">
                    {sources.map((source) => (
                        <li key={source.listingSourceId}>
                            <button
                                type="button"
                                className="w-full p-3 text-left hover:bg-muted focus-visible:outline focus-visible:outline-ring"
                                onClick={() => {
                                    onChange(source);
                                    setSearch("");
                                }}
                            >
                                {source.name} · {source.operatorName}
                            </button>
                        </li>
                    ))}
                </ul>
            );
        }
    }
    return (
        <div className="grid gap-2">
            <Label htmlFor="application-source-search">
                {t("partnerApplications.proposals.existing")}
            </Label>
            <Input
                id="application-source-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoComplete="off"
            />
            <p className="text-sm text-muted-foreground">
                {t("partnerApplications.proposals.selectionHint")}
            </p>
            {value && (
                <div className="flex items-center justify-between border p-3">
                    <span>
                        {value.name} · {value.operatorName}
                    </span>
                    <Button type="button" variant="ghost" onClick={() => onChange(null)}>
                        {t("partnerApplications.proposals.clear")}
                    </Button>
                </div>
            )}
            {searchResults}
        </div>
    );
}
