import { useLocation, useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { serializeSearchParams } from "@/features/search/products/lib/searchValidation.ts";
import { stripLanguageFromPathname } from "@/i18n/routing.ts";

export const SEARCH_TYPES = ["products", "shops"] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

/**
 * Shared submit behaviour of the global search fields: reads the current query from the
 * search routes and navigates to product or shop search, keeping active product filters.
 */
export function useGlobalSearchSubmit() {
    const navigate = useNavigate({ from: "/$lng" });
    const pathname = useLocation({
        select: (location) => location.pathname,
    });
    const routePathname = stripLanguageFromPathname(pathname);
    const isNavigating = useRouterState({ select: (s) => s.isLoading });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset isSubmitting when navigation completes
    useEffect(() => {
        if (!isNavigating && isSubmitting) {
            setIsSubmitting(false);
        }
    }, [isNavigating, isSubmitting]);

    const searchParams = useSearch({ strict: false });
    const isOnProductSearch = routePathname === "/search";
    const isOnShopSearch = routePathname === "/search/shops";
    const currentQuery =
        isOnProductSearch || isOnShopSearch ? (searchParams.q as string) || "" : "";

    function submit(query: string, searchType: SearchType) {
        setIsSubmitting(true);
        if (searchType === "shops") {
            navigate({
                to: "/$lng/search/shops",
                search: {
                    q: query,
                },
            });
            return;
        }
        navigate({
            to: "/$lng/search",
            search: serializeSearchParams({
                ...searchParams,
                q: query,
            }),
        });
    }

    return {
        currentQuery,
        isOnProductSearch,
        isOnShopSearch,
        isPending: isSubmitting && isNavigating,
        submit,
    };
}
