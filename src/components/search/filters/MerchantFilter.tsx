import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { Controller, useFormContext, useFormState } from "react-hook-form";
import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Input } from "@/components/ui/input.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { useTranslation } from "react-i18next";

export function MerchantFilter() {
    const { control } = useFormContext<FilterSchema>();
    const { errors } = useFormState({ control, name: ["merchant"] });
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <H2>{t("search.filter.merchant")}</H2>
            </CardHeader>
            <CardContent>
                <Controller
                    name="merchant"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type={"text"}
                            placeholder={t("search.filter.anyMerchant")}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />
                {errors?.merchant && (
                    <p className="text-destructive text-sm mt-1">
                        {String(errors.merchant.message ?? "")}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
