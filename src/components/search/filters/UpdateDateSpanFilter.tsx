import { H2 } from "@/components/typography/H2";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { DatePicker } from "@/components/search/filters/util/DatePicker.tsx";
import { useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button.tsx";
import { FILTER_DEFAULTS } from "@/lib/filterDefaults.ts";
import { FilterX } from "lucide-react";

export function UpdateDateSpanFilter() {
    const { control, setValue } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["updateDate.to"] });
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <H2>{t("search.filter.updateDate")}</H2>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setValue("updateDate", FILTER_DEFAULTS.updateDate)}
                            className="h-8 w-8 p-0"
                        >
                            <FilterX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Filter für das Aktualisierungsdatum zurücksetzen</p>
                    </TooltipContent>
                </Tooltip>
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
