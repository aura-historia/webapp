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
import { Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { z } from "zod";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";
import { useSearchQueryContext } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import { useEffect, useMemo, useState } from "react";
import { env } from "@/env.ts";
import { useAnimatedPlaceholder } from "@/features/search/common/hooks/useAnimatedPlaceholder.ts";
import {
    type SearchType,
    useGlobalSearchSubmit,
} from "@/features/search/common/hooks/useGlobalSearchSubmit.ts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

/** The hero search form: search type, animated example placeholder and submit button. */
export function SearchBar() {
    const { t } = useTranslation();
    const { setQuery } = useSearchQueryContext();
    const {
        currentQuery,
        isOnProductSearch,
        isOnShopSearch,
        isPending: showLoading,
        submit,
    } = useGlobalSearchSubmit();

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

    const placeholderExamples = useMemo(() => {
        const examples = t(
            searchType === "shops"
                ? "search.bar.placeholderExamplesShops"
                : "search.bar.placeholderExamplesProducts",
            { returnObjects: true },
        );
        return Array.isArray(examples) ? examples : [];
    }, [t, searchType]);

    // Animate the placeholder only while the input is empty
    const animatedText = useAnimatedPlaceholder({
        examples: placeholderExamples,
        enabled: !queryValue,
        resetKey: searchType,
    });

    function onSubmit(values: SearchFormSchema) {
        submit(values.query, searchType);
    }

    return (
        <Form {...form}>
            <form className="flex items-start w-full gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem className="grow flex flex-col">
                            <FormLabel className="sr-only">{t("search.bar.label")}</FormLabel>
                            <div className="flex items-center h-12 w-full overflow-hidden rounded-sm bg-background shadow-sm">
                                <Select
                                    value={searchType}
                                    onValueChange={(value) => setSearchType(value as SearchType)}
                                    disabled={!isSearchEnabled}
                                >
                                    <SelectTrigger
                                        aria-label={t("search.bar.searchTypeLabel")}
                                        data-testid="search-type-select"
                                        className="h-full w-32 shrink-0 rounded-none border-0 border-r bg-background px-4 text-base text-foreground shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:w-40"
                                    >
                                        <SelectValue>
                                            {searchType === "shops"
                                                ? t("search.bar.searchType.shops")
                                                : t("search.bar.searchType.products")}
                                        </SelectValue>
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
                                        autoFocus
                                        className="h-full rounded-none border-0 bg-transparent font-medium shadow-none text-base! focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        type="search"
                                        placeholder={animatedText}
                                        aria-label={t("search.bar.label")}
                                        disabled={!isSearchEnabled}
                                        {...field}
                                        inputMode="search"
                                        enterKeyHint="search"
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="mt-0 h-12 shadow-sm"
                    disabled={!isSearchEnabled || showLoading}
                >
                    <span className="hidden sm:inline text-lg">{t("search.bar.button")}</span>
                    {showLoading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
            </form>
        </Form>
    );
}
