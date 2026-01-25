import type { FilterSchema } from "@/components/search/SearchFilters.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function OriginYearFilter() {
    const { control, setValue } = useFormContext<FilterSchema>();
    const { t } = useTranslation();

    const handleChange = (raw: string, field: "originYearSpan.min" | "originYearSpan.max") => {
        if (raw === "") {
            setValue(field, undefined, { shouldDirty: true });
            return;
        }
        if (!/^\d+$/.test(raw)) return;
        setValue(field, Number(raw), { shouldDirty: true });
    };

    return (
        <div className="space-y-2">
            <Label>{t("search.filter.originYear")}</Label>
            <div className="flex flex-row gap-2 items-center">
                <Controller
                    name="originYearSpan.min"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("search.filter.min")}
                            value={field.value ?? ""}
                            onChange={(e) => handleChange(e.target.value, "originYearSpan.min")}
                        />
                    )}
                />
                <span>-</span>
                <Controller
                    name="originYearSpan.max"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("search.filter.max")}
                            value={field.value ?? ""}
                            onChange={(e) => handleChange(e.target.value, "originYearSpan.max")}
                        />
                    )}
                />
            </div>
        </div>
    );
}
