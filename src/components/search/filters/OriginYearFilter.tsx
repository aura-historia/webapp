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
            <Label className="text-xs font-semibold tracking-[0.08em] uppercase text-on-surface-variant">
                {t("search.filter.originYear")}
            </Label>
            <div className="flex items-center gap-2">
                <Controller
                    name="originYearSpan.min"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("search.filter.min")}
                            className="h-9 rounded-none border-0 border-b border-outline-variant bg-transparent px-0 py-0 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0"
                            value={field.value ?? ""}
                            onChange={(e) => handleChange(e.target.value, "originYearSpan.min")}
                        />
                    )}
                />
                <span className="text-on-surface-variant/70">-</span>
                <Controller
                    name="originYearSpan.max"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("search.filter.max")}
                            className="h-9 rounded-none border-0 border-b border-outline-variant bg-transparent px-0 py-0 text-sm shadow-none focus-visible:border-primary focus-visible:ring-0"
                            value={field.value ?? ""}
                            onChange={(e) => handleChange(e.target.value, "originYearSpan.max")}
                        />
                    )}
                />
            </div>
        </div>
    );
}
