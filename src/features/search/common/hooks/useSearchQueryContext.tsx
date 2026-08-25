import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";

type SearchQueryContextValue = {
    /** Sets the current search query value */
    setQuery: (query: string) => void;
    /** Gets the current search query value */
    getQuery: () => string;
};

const SearchQueryContext = createContext<SearchQueryContextValue | null>(null);

export function SearchQueryProvider({ children }: { readonly children: ReactNode }) {
    const queryRef = useRef<string>("");

    const value = useMemo<SearchQueryContextValue>(
        () => ({
            setQuery: (query: string) => {
                queryRef.current = query;
            },
            getQuery: () => queryRef.current,
        }),
        [],
    );

    return <SearchQueryContext.Provider value={value}>{children}</SearchQueryContext.Provider>;
}

export function useSearchQueryContext(): SearchQueryContextValue {
    const context = useContext(SearchQueryContext);
    if (!context) {
        throw new Error("useSearchQueryContext must be used within a SearchQueryProvider");
    }
    return context;
}
