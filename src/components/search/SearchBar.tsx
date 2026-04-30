import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { Search, Loader2 } from "lucide-react";
import { cn, mapFiltersToUrlParams } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { z } from "zod";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/filterDefaults.ts";
import { useSearchQueryContext } from "@/hooks/search/useSearchQueryContext.tsx";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { env } from "@/env.ts";
import { useAnimatedPlaceholder } from "@/hooks/useAnimatedPlaceholder";
import { serializeSearchParams } from "@/lib/searchValidation.ts";
import type { SearchFilterArguments } from "@/data/internal/search/SearchFilterArguments.ts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
export const SEARCH_TYPES = ["products", "shops"] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

interface SearchBarProps {
    readonly type: "small" | "big";
}

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

const createSearchFormSchema = (t: TFunction) =>
    z.object({
        query: z
            .string()
            .trim()
            .min(MIN_SEARCH_QUERY_LENGTH, {
                error: t("search.validation.queryMinLength"),
            }),
    });

export type SearchFormSchema = z.infer<ReturnType<typeof createSearchFormSchema>>;

export function SearchBar({ type }: SearchBarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: "/" });
    const pathname = useLocation({
        select: (location) => location.pathname,
    });
    const isNavigating = useRouterState({ select: (s) => s.isLoading });
    const { setQuery } = useSearchQueryContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset isSubmitting when navigation completes
    useEffect(() => {
        if (!isNavigating && isSubmitting) {
            setIsSubmitting(false);
        }
    }, [isNavigating, isSubmitting]);

    const showLoading = isSubmitting && isNavigating;

    const searchParams = useSearch({ strict: false });
    const isOnProductSearch = pathname === "/search";
    const isOnShopSearch = pathname === "/search/shops";
    const currentQuery =
        isOnProductSearch || isOnShopSearch ? (searchParams.q as string) || "" : "";

    // Default to "products" unless the user is currently on the shop search page.
    const [searchType, setSearchType] = useState<SearchType>(isOnShopSearch ? "shops" : "products");

    // Keep the selector in sync with the current route (e.g. after navigation).
    useEffect(() => {
        if (isOnShopSearch) {
            setSearchType("shops");
        } else if (isOnProductSearch) {
            setSearchType("products");
        }
    }, [isOnProductSearch, isOnShopSearch]);

    const searchFormSchema = useMemo(() => createSearchFormSchema(t), [t]);

    const form = useForm<SearchFormSchema>({
        resolver: zodResolver(searchFormSchema),
        values: {
            query: currentQuery,
        },
    });

    // Sync the form query value to the context whenever it changes
    const queryValue = form.watch("query");
    useEffect(() => {
        setQuery(queryValue);
    }, [queryValue, setQuery]);

    // Get animated placeholder examples from i18n
    const placeholderExamples = useMemo(() => {
        const examples = t("search.bar.placeholderExamples", { returnObjects: true });
        // Validate that we received an array of strings, fallback to empty array
        return Array.isArray(examples) ? examples : [];
    }, [t]);

    // Use animated placeholder only for big variant and when input is empty
    const animatedText = useAnimatedPlaceholder({
        examples: placeholderExamples,
        enabled: type === "big" && !queryValue,
    });

    function onSubmit(values: SearchFormSchema) {
        setIsSubmitting(true);
        if (searchType === "shops") {
            navigate({
                to: "/search/shops",
                search: {
                    q: values.query,
                },
            });
            return;
        }
        navigate({
            to: "/search",
            search: (prev) => {
                const currentParams = serializeSearchParams(prev as SearchFilterArguments);
                return {
                    ...currentParams,
                    ...mapFiltersToUrlParams({
                        query: values.query,
                        priceSpan: {
                            min: searchParams.priceFrom,
                            max: searchParams.priceTo,
                        },
                        productState: searchParams.allowedStates,
                        creationDate: {
                            from: searchParams.creationDateFrom,
                            to: searchParams.creationDateTo,
                        },
                        updateDate: {
                            from: searchParams.updateDateFrom,
                            to: searchParams.updateDateTo,
                        },
                        merchant: searchParams.merchant,
                    }),
                };
            },
        });
    }

    return (
        <Form {...form}>
            <form
                className={
                    type === "big"
                        ? "flex items-start w-full gap-4"
                        : "flex items-start gap-2 w-full"
                }
                onSubmit={form.handleSubmit(onSubmit, () => {
                    if (type === "small") {
                        toast.warning(t("search.validation.queryMinLength"), {
                            position: "top-center",
                            duration: 2000,
                        });
                    }
                })}
            >
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem className={cn("grow flex", type === "big" ? "flex-col" : "")}>
                            <FormLabel className="sr-only">{t("search.bar.label")}</FormLabel>
                            <div
                                className={cn(
                                    type === "big"
                                        ? "flex items-center h-12 w-full overflow-hidden rounded-sm bg-background shadow-sm"
                                        : "contents",
                                )}
                            >
                                <Select
                                    value={searchType}
                                    onValueChange={(value) => setSearchType(value as SearchType)}
                                    disabled={!isSearchEnabled}
                                >
                                    <SelectTrigger
                                        aria-label={t("search.bar.searchTypeLabel")}
                                        data-testid="search-type-select"
                                        className={cn(
                                            "shrink-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                            type === "big"
                                                ? "h-full w-32 rounded-none border-0 border-r bg-background px-4 text-base text-foreground shadow-none sm:w-40"
                                                : "h-9 w-24 rounded-sm text-sm sm:w-32",
                                        )}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="products">
                                                {t("search.bar.searchType.products")}
                                            </SelectItem>
                                            <SelectItem value="shops">
                                                {t("search.bar.searchType.shops")}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormControl>
                                    <Input
                                        autoFocus={type === "big"}
                                        className={cn(
                                            "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                            type === "big"
                                                ? "h-full rounded-none border-0 bg-transparent font-medium shadow-none text-base!"
                                                : "h-9 rounded-sm",
                                        )}
                                        type="search"
                                        placeholder={
                                            type === "big"
                                                ? animatedText
                                                : t("search.bar.placeholderShort")
                                        }
                                        aria-label={t("search.bar.label")}
                                        disabled={!isSearchEnabled}
                                        {...field}
                                        inputMode="search"
                                        enterKeyHint="search"
                                    />
                                </FormControl>
                            </div>
                            {type === "big" && <FormMessage />}
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className={type === "big" ? "mt-0 h-12 shadow-sm" : "h-9"}
                    disabled={!isSearchEnabled || showLoading}
                >
                    <span className={type === "big" ? "hidden sm:inline text-lg" : "hidden"}>
                        {t("search.bar.button")}
                    </span>
                    {showLoading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
            </form>
        </Form>
    );
}
