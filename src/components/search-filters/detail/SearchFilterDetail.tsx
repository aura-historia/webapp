import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Search, ServerCrash, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { CreateSearchFilterWizard } from "@/components/search-filters/CreateSearchFilterWizard.tsx";
import { SearchFilterMatches } from "@/components/search-filters/match/SearchFilterMatches.tsx";
import { useUserSearchFilter } from "@/hooks/search-filters/useUserSearchFilter.ts";
import { serializeSearchParams } from "@/lib/searchValidation.ts";

type Props = {
    readonly filterId: string;
};

export function SearchFilterDetail({ filterId }: Props) {
    const { t } = useTranslation();
    const { data: filter, error } = useUserSearchFilter(filterId);
    const [editOpen, setEditOpen] = useState(false);

    if (error) {
        return (
            <EmptyState
                icon={ServerCrash}
                title={t("searchFilters.loadingError.title")}
                description={t("searchFilters.loadingError.description")}
            />
        );
    }

    return (
        <div className="flex flex-col w-full gap-8">
            {filter && (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                            <H1 className="text-ellipsis line-clamp-1">{filter.name}</H1>
                            {filter.enhancedSearchDescription && (
                                <p className="text-base text-muted-foreground italic">
                                    {filter.enhancedSearchDescription}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setEditOpen(true)}
                            >
                                <Settings2 className="size-4" />
                                {t("searchFilters.edit")}
                            </Button>
                            <Button size="sm" className="gap-2" asChild>
                                <Link to="/search" search={serializeSearchParams(filter.search)}>
                                    <Search className="size-4" />
                                    {t("searchFilters.searchNow")}
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <CreateSearchFilterWizard
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        mode="edit"
                        filter={filter}
                    />
                </>
            )}

            <SearchFilterMatches filterId={filterId} />
        </div>
    );
}
