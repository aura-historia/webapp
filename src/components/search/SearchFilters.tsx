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
import { useEffect, useMemo } from "react";
import { formatToDateString } from "@/lib/utils.ts";
import { UpdateDateSpanFilter } from "@/components/search/filters/UpdateDateSpanFilter.tsx";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

const createFilterSchema = (t: TFunction) =>
    z
        .object({
            priceSpan: z
                .object({
                    min: z.number().min(0).optional().or(z.undefined()),
                    max: z.number().min(0).optional().or(z.undefined()),
                })
                .optional(),
            itemState: z.array(
                z.enum(["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"]),
            ),
            creationDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            updateDate: z.object({
                from: z.date().optional(),
                to: z.date().optional(),
            }),
            merchant: z
                .string()
                .min(3, { error: t("search.validation.merchantMinLength") })
                .optional()
                .or(z.string().max(0)),
        })
        .superRefine((data, ctx) => {
            if (
                data.creationDate.from &&
                data.creationDate.to &&
                data.creationDate.from > data.creationDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["creationDate", "to"],
                });
            }
            if (
                data.updateDate.from &&
                data.updateDate.to &&
                data.updateDate.from > data.updateDate.to
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: t("search.validation.dateOrder"),
                    path: ["updateDate", "to"],
                });
            }
        });

export type FilterSchema = z.infer<ReturnType<typeof createFilterSchema>>;

type SearchFilterProps = {
    readonly searchFilters: SearchFilterArguments;
};

export function SearchFilters({ searchFilters }: SearchFilterProps) {
    const navigate = useNavigate({ from: "/search" });
    const { t } = useTranslation();

    const filterSchema = useMemo(() => createFilterSchema(t), [t]);

    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            priceSpan: { min: undefined, max: undefined },
            itemState: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
            creationDate: {
                from: undefined,
                to: undefined,
            },
            updateDate: {
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
        if (searchFilters.updateDateFrom) {
            form.setValue("updateDate.from", new Date(searchFilters.updateDateFrom), {
                shouldDirty: false,
            });
        }
        if (searchFilters.updateDateTo) {
            form.setValue("updateDate.to", new Date(searchFilters.updateDateTo), {
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
        searchFilters.updateDateFrom,
        searchFilters.updateDateTo,
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
                updateDateFrom: data.updateDate.from
                    ? formatToDateString(data.updateDate.from)
                    : undefined,
                updateDateTo: data.updateDate.to
                    ? formatToDateString(data.updateDate.to)
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
                    <UpdateDateSpanFilter />
                    <MerchantFilter />
                </div>
                <Button className="w-full shadow-sm" type="submit">
                    {t("search.applyFilters")}
                </Button>
            </form>
        </Form>
    );
}
