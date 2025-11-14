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
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { mapFiltersToUrlParams } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { z } from "zod";
import { useMemo } from "react";

interface SearchBarProps {
    readonly type: "small" | "big";
    readonly showOnLandingPage?: boolean;
}

const createSearchFormSchema = (t: TFunction) =>
    z.object({
        query: z
            .string()
            .trim()
            .min(3, {
                error: t("search.validation.queryMinLength"),
            }),
    });

export type SearchFormSchema = z.infer<ReturnType<typeof createSearchFormSchema>>;

const SEARCH_BAR_HIDDEN_ROUTES = new Set(["/auth"]);

export function SearchBar({ type, showOnLandingPage = false }: SearchBarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: "/" });
    const pathname = useLocation({
        select: (location) => location.pathname,
    });

    const searchParams = useSearch({ strict: false });
    const currentQuery = pathname === "/search" ? (searchParams.q as string) || "" : "";

    const searchFormSchema = useMemo(() => createSearchFormSchema(t), [t]);

    const form = useForm<SearchFormSchema>({
        resolver: zodResolver(searchFormSchema),
        values: {
            query: currentQuery,
        },
    });

    function onSubmit(values: SearchFormSchema) {
        navigate({
            to: "/search",
            search: mapFiltersToUrlParams({
                query: values.query,
                priceSpan: {
                    min: searchParams.priceFrom,
                    max: searchParams.priceTo,
                },
                itemState: searchParams.allowedStates,
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
        });
    }

    if (SEARCH_BAR_HIDDEN_ROUTES.has(pathname) && type === "small") return null;

    const isLandingPage = pathname === "/" && type === "small";
    const isVisible = !isLandingPage || showOnLandingPage;

    return (
        <Form {...form}>
            <form
                className={
                    type === "big"
                        ? "flex items-start w-full gap-4"
                        : isLandingPage
                          ? `flex items-start gap-2 w-full transition-all duration-500 ease-in-out ${
                                isVisible
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 -translate-y-2 pointer-events-none"
                            }`
                          : "flex items-start gap-2 w-full"
                }
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormLabel className="sr-only">{t("search.bar.label")}</FormLabel>
                            <FormControl>
                                <Input
                                    autoFocus={type === "big"}
                                    className={type === "big" ? "h-12 font-medium !text-lg" : "h-9"}
                                    type={"text"}
                                    placeholder={t("search.bar.placeholder")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className={type === "big" ? "mt-0 h-12" : "h-9"}>
                    <span className={type === "big" ? "hidden sm:inline text-lg" : "hidden"}>
                        {t("search.bar.button")}
                    </span>
                    <Search />
                </Button>
            </form>
        </Form>
    );
}
