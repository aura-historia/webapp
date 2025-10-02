import { CreationDateSpanFilter } from "@/components/search/filters/CreationDateSpanFilter.tsx";
import { ItemStateFilter } from "@/components/search/filters/ItemStateFilter.tsx";
import { PriceSpanFilter } from "@/components/search/filters/PriceSpanFilter.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MerchantFilter } from "@/components/search/filters/MerchantFilter.tsx";
import { useNavigate } from "@tanstack/react-router";
import type { SearchFilterArguments } from "@/data/internal/SearchFilterArguments.ts";
import { useEffect } from "react";
import { formatToDateString } from "@/lib/utils.ts";

const filterSchema = z.object({
    priceSpan: z
        .object({
            min: z.number().min(0).optional().or(z.undefined()),
            max: z.number().min(0).optional().or(z.undefined()),
        })
        .optional(),
    itemState: z.array(z.enum(["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"])),
    creationDate: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }),
    merchant: z.string().optional(),
});

export type FilterSchema = z.infer<typeof filterSchema>;

type SearchFilterProps = {
    readonly searchFilters: SearchFilterArguments;
};

export function SearchFilters({ searchFilters }: SearchFilterProps) {
    const navigate = useNavigate({ from: "/search" });

    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            priceSpan: { min: undefined, max: undefined },
            itemState: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
            creationDate: {
                from: undefined,
                to: undefined,
            },
            merchant: undefined,
        },
        mode: "onSubmit",
    });

    // Set initial values from search filters after form is created
    useEffect(() => {
        if (searchFilters.priceFrom !== undefined) {
            form.setValue("priceSpan.min", searchFilters.priceFrom, { shouldDirty: false });
        }
        if (searchFilters.priceTo !== undefined) {
            form.setValue("priceSpan.max", searchFilters.priceTo, { shouldDirty: false });
        }
        if (searchFilters.creationDateFrom) {
            form.setValue("creationDate.from", new Date(searchFilters.creationDateFrom), {
                shouldDirty: false,
            });
        }
        if (searchFilters.creationDateTo) {
            form.setValue("creationDate.to", new Date(searchFilters.creationDateTo), {
                shouldDirty: false,
            });
        }
        if (searchFilters.merchant) {
            form.setValue("merchant", searchFilters.merchant, { shouldDirty: false });
        }
        if (searchFilters.allowedStates) {
            form.setValue("itemState", searchFilters.allowedStates, { shouldDirty: false });
        }
    }, [
        searchFilters.priceFrom,
        searchFilters.priceTo,
        searchFilters.creationDateFrom,
        searchFilters.creationDateTo,
        searchFilters.merchant,
        searchFilters.allowedStates,
        form,
    ]);

    const onSubmit = (data: FilterSchema) => {
        navigate({
            to: "/search",
            search: {
                q: searchFilters.q,
                priceFrom: data.priceSpan?.min,
                priceTo: data.priceSpan?.max,
                allowedStates: data.itemState.length > 0 ? data.itemState : undefined,
                creationDateFrom: data.creationDate.from
                    ? formatToDateString(data.creationDate.from)
                    : undefined,
                creationDateTo: data.creationDate.to
                    ? formatToDateString(data.creationDate.to)
                    : undefined,
                merchant: data.merchant ? data.merchant : undefined,
            },
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className={"flex flex-col gap-4"}>
                    <PriceSpanFilter />
                    <ItemStateFilter />
                    <CreationDateSpanFilter />
                    <MerchantFilter />
                </div>
                <Button className="w-full shadow-sm" type="submit">
                    Filter anwenden
                </Button>
            </form>
        </Form>
    );
}
