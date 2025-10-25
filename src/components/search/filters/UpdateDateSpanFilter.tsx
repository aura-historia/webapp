import { H2 } from "@/components/typography/H2";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { DatePicker } from "@/components/search/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";

export function UpdateDateSpanFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["updateDate.to"] });
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <H2>{t("search.filter.updateDate")}</H2>
            </CardHeader>
            <CardContent>
                <div className={"flex flex-col w-full gap-2"}>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>{t("search.filter.from")}</span>
                        <DatePicker fieldName="updateDate.from" />
                    </div>
                    <div className={"flex flex-row gap-2 items-center justify-between"}>
                        <span>{t("search.filter.to")}</span>
                        <DatePicker fieldName="updateDate.to" />
                    </div>
                    {errors?.updateDate?.to && (
                        <p className="text-destructive text-sm mt-1">
                            {String(errors.updateDate.to.message ?? "")}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
