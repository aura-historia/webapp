// src/components/search/SearchResults.tsx
import { ItemCard } from "@/components/item/ItemCard.tsx";
import { ItemCardSkeleton } from "@/components/item/ItemCardSkeleton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { useSimpleSearch } from "@/hooks/useSimpleSearch.ts";
import { v4 as uuidv4 } from "uuid";

type SearchResultsProps = {
    readonly query: string;
};

export function SearchResults({ query }: SearchResultsProps) {
    const { data, isLoading, error } = useSimpleSearch(query);

    if (query.length < 3) {
        return <H2>Bitte geben Sie mindestens 3 Zeichen ein, um die Suche zu starten.</H2>;
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }, () => (
                    <ItemCardSkeleton key={uuidv4()} />
                ))}
            </div>
        );
    }

    if (error) {
        return <H2>Fehler beim Laden der Suchergebnisse. Bitte versuchen Sie es später erneut!</H2>;
    }

    if (data?.data?.items.length === 0) {
        return <H2>Keine Artikel gefunden!</H2>;
    }

    return (
        <div className="flex flex-col gap-4">
            {data?.data?.items.map((item) => (
                <ItemCard key={item.itemId} item={item} />
            ))}
        </div>
    );
}
