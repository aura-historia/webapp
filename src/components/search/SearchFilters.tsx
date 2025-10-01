import { PriceSpanFilter } from "@/components/search/filters/PriceSpanFilter.tsx";
import { Form } from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const filterSchema = z.object({
    priceSpan: z
        .object({
            min: z.number().min(0).optional(),
            max: z.number().min(0).optional(),
        })
        .optional(),
    itemStatus: z
        .array(z.enum(["LISTED", "AVAILABLE", "RESERVED", "SOLD", "REMOVED", "UNKNOWN"]))
        .optional(),
    creationDate: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }),
    merchant: z.string().min(1).optional(),
});

export type FilterSchema = z.infer<typeof filterSchema>;

export function SearchFilters() {
    const filterForm = useForm<z.infer<typeof filterSchema>>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            priceSpan: { min: undefined, max: undefined },
            itemStatus: [],
            creationDate: { from: undefined, to: undefined },
            merchant: "",
        },
        mode: "onChange",
    });

    return (
        <FormProvider {...filterForm}>
            <Form {...filterForm}>
                <form
                    onSubmit={filterForm.handleSubmit((data) => {
                        console.log(data);
                    })}
                    className="space-y-4"
                >
                    <div className="">
                        <PriceSpanFilter />
                        {/* Add other filters similarly:
                <ItemStatusFilter />
                <CreationDateFilter />
                <MerchantFilter />
                    */}
                    </div>
                    {/* <Button type="submit">Apply</Button> (if you have a Button component) */}
                </form>
            </Form>
        </FormProvider>
    );
}
