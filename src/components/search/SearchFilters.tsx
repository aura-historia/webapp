import { ItemStateFilter } from "@/components/search/filters/ItemStateFilter.tsx";
import { PriceSpanFilter } from "@/components/search/filters/PriceSpanFilter.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

export function SearchFilters() {
    const form = useForm<FilterSchema>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            priceSpan: { min: undefined, max: undefined },
            itemState: ["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"],
            creationDate: { from: undefined, to: undefined },
            merchant: "",
        },
        mode: "onChange",
    });

    const onSubmit = (data: FilterSchema) => {
        console.log("[SearchFilters] submit", data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className={"flex flex-col gap-4"}>
                    <PriceSpanFilter />
                    <ItemStateFilter />
                </div>
                <Button className="w-full shadow-sm" type="submit">
                    Filter anwenden
                </Button>
            </form>
        </Form>
    );
}
