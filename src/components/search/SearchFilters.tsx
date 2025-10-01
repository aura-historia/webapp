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

const filterSchema = z.object({
    priceSpan: z
        .object({
            min: z.number().min(0).optional(),
            max: z.number().min(0).optional(),
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
    query: string;
};

export function SearchFilters({ query }: SearchFilterProps) {
    const navigate = useNavigate({ from: "/search" });

    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            priceSpan: { min: undefined, max: undefined },
            itemState: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
            creationDate: { from: undefined, to: undefined },
            merchant: undefined,
        },
        mode: "onChange",
    });

    const onSubmit = (data: FilterSchema) => {
        navigate({
            to: "/search",
            search: {
                q: query,
                priceFrom: data.priceSpan?.min,
                priceTo: data.priceSpan?.max,
                allowedStates: data.itemState.length > 0 ? data.itemState : undefined,
                creationDateFrom: data.creationDate.from
                    ? data.creationDate.from.toISOString().split("T")[0]
                    : undefined,
                creationDateTo: data.creationDate.to
                    ? data.creationDate.to.toISOString().split("T")[0]
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
