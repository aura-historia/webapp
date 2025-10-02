import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { v4 as uuidv4 } from "uuid";
import { useFilteredSearch } from "@/hooks/useFilteredSearch.ts";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";

type FilteredSearchResultsProps = {
    searchFilters: SearchFilterArguments;
};

export function FilteredSearchResults({ searchFilters }: FilteredSearchResultsProps) {
    const { data, isPending, error } = useFilteredSearch(searchFilters);

    if (searchFilters.q.length < 3) {
        return (
            <SectionInfoText>
                Bitte geben Sie mindestens 3 Zeichen ein, um die Suche zu starten.
            </SectionInfoText>
        );
    }

    if (isPending) {
        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }, () => (
                    <ItemCardSkeleton key={uuidv4()} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <SectionInfoText>
                Fehler beim Laden der Suchergebnisse. Bitte versuchen Sie es später erneut!
            </SectionInfoText>
        );
    }

    if (data?.data?.items.length === 0) {
        return <SectionInfoText>Keine Artikel gefunden!</SectionInfoText>;
    }

    return (
        <div className="flex flex-col gap-4">
            {data?.data?.items.map((item) => (
                <ItemCard key={item.itemId} item={item} />
            ))}
        </div>
    );
}
