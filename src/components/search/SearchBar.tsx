import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { useTranslation } from "react-i18next";
import { mapFiltersToUrlParams } from "@/lib/utils.ts";

interface SearchBarProps {
    readonly type: "small" | "big";
}

export function SearchBar({ type }: SearchBarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: "/" });
    const pathname = useLocation({
        select: (location) => location.pathname,
    });

    const searchParams = useSearch({ strict: false });
    const currentQuery = pathname === "/search" ? (searchParams.q as string) || "" : "";

    const searchFormSchema = z.object({
        query: z
            .string()
            .trim()
            .min(3, {
                error: t("search.bar.validation.minLength"),
            }),
    });

    const form = useForm<z.infer<typeof searchFormSchema>>({
        resolver: zodResolver(searchFormSchema),
        values: {
            query: currentQuery,
        },
    });

    function onSubmit(values: z.infer<typeof searchFormSchema>) {
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

    if (pathname === "/" && type === "small") return;

    return (
        <Form {...form}>
            <form
                className={
                    type === "big"
                        ? "flex items-start w-full gap-4"
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
                                    className={
                                        type === "big" ? "h-12 font-medium !text-lg" : "h-10"
                                    }
                                    type={"text"}
                                    placeholder={t("search.bar.placeholder")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className={type === "big" ? "mt-0 h-12" : "h-10"}>
                    <span className={type === "big" ? "hidden sm:inline text-lg" : "hidden"}>
                        {t("search.bar.button")}
                    </span>
                    <Search />
                </Button>
            </form>
        </Form>
    );
}
