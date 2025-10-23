import { H2 } from "@/components/typography/H2";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { DatePicker } from "@/components/search/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";

export function CreationDateSpanFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["creationDate.to"] });

    return (
        <Card>
            <CardHeader>
                <H2>Hinzugefügt</H2>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col w-full gap-2"}>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>Von: </span>
                        <DatePicker fieldName="creationDate.from" />
                    </div>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>Bis: </span>
                        <DatePicker fieldName="creationDate.to" />
                    </div>
                    {errors?.creationDate?.to && (
                        <p className="text-destructive text-sm mt-1">
                            {String(errors.creationDate.to.message ?? "")}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
