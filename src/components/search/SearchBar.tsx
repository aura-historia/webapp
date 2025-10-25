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
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { z } from "zod";
import { useMemo } from "react";

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

export function SearchBar() {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: "/" });

    const searchFormSchema = useMemo(() => createSearchFormSchema(t), [t]);

    const form = useForm<SearchFormSchema>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            query: "",
        },
    });

    function onSubmit(values: SearchFormSchema) {
        navigate({
            to: "/search",
            search: {
                q: values.query,
            },
        });
    }

    return (
        <Form {...form}>
            <form
                className={"flex items-start w-full gap-4"}
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
                                    className={"h-12 font-medium !text-lg"}
                                    type={"text"}
                                    placeholder={t("search.bar.placeholder")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="mt-0 h-12">
                    <span className={"hidden sm:inline text-lg"}>{t("search.bar.button")}</span>
                    <Search />
                </Button>
            </form>
        </Form>
    );
}
