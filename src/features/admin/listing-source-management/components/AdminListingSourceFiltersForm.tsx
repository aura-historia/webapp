import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    ADMIN_LISTING_SOURCE_INGESTION_METHODS,
    ADMIN_LISTING_SOURCE_SORT_FIELDS,
    type AdminListingSourceFilters,
    type AdminListingSourceSortField,
    type AdminListingSourceSortOrder,
} from "@/data/internal/listing-source/AdminListingSource.ts";

const SORT_OPTIONS = ADMIN_LISTING_SOURCE_SORT_FIELDS.flatMap((sort) => [
    `${sort}:asc`,
    `${sort}:desc`,
]) as readonly `${AdminListingSourceSortField}:${AdminListingSourceSortOrder}`[];

const filterSchema = z.object({
    query: z.string(),
    name: z.string(),
    listingSourceId: z.string(),
    listingSourceSlugId: z.string(),
    operatorPartyId: z.string(),
    ingestionMethod: z.enum(["", ...ADMIN_LISTING_SOURCE_INGESTION_METHODS]),
    sortOption: z.enum(SORT_OPTIONS),
});

type FilterValues = z.infer<typeof filterSchema>;

function toFilterValues(filters: AdminListingSourceFilters): FilterValues {
    return {
        query: filters.query ?? "",
        name: filters.name ?? "",
        listingSourceId: filters.listingSourceId ?? "",
        listingSourceSlugId: filters.listingSourceSlugId ?? "",
        operatorPartyId: filters.operatorPartyId ?? "",
        ingestionMethod: filters.ingestionMethod ?? "",
        sortOption:
            `${filters.sort ?? "name"}:${filters.order ?? "asc"}` as FilterValues["sortOption"],
    };
}

function toFilters(values: FilterValues): AdminListingSourceFilters {
    const [sort, order] = values.sortOption.split(":") as [
        AdminListingSourceSortField,
        AdminListingSourceSortOrder,
    ];
    const filters: AdminListingSourceFilters = {
        query: values.query.trim(),
        name: values.name.trim(),
        listingSourceId: values.listingSourceId.trim(),
        listingSourceSlugId: values.listingSourceSlugId.trim(),
        operatorPartyId: values.operatorPartyId.trim(),
        ingestionMethod: values.ingestionMethod || undefined,
        sort,
        order,
    };
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined),
    ) as AdminListingSourceFilters;
}

export function AdminListingSourceFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminListingSourceFilters;
    readonly onApply: (filters: AdminListingSourceFilters) => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: toFilterValues(filters),
    });
    const ingestionMethod = useController({ control: form.control, name: "ingestionMethod" }).field;
    const sortOption = useController({ control: form.control, name: "sortOption" }).field;

    return (
        <form
            onSubmit={form.handleSubmit((values) => onApply(toFilters(values)))}
            className="grid gap-4 border bg-surface-container-low p-4"
            aria-label={t("adminListingSources.filters.title")}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SourceTextFilter
                    id="admin-listing-sources-query"
                    name="query"
                    label={t("adminListingSources.filters.query")}
                    register={form.register}
                />
                <SourceTextFilter
                    id="admin-listing-sources-name"
                    name="name"
                    label={t("adminListingSources.filters.name")}
                    register={form.register}
                />
                <SourceTextFilter
                    id="admin-listing-sources-id"
                    name="listingSourceId"
                    label={t("adminListingSources.filters.listingSourceId")}
                    register={form.register}
                />
                <SourceTextFilter
                    id="admin-listing-sources-slug"
                    name="listingSourceSlugId"
                    label={t("adminListingSources.filters.listingSourceSlugId")}
                    register={form.register}
                />
                <SourceTextFilter
                    id="admin-listing-sources-operator"
                    name="operatorPartyId"
                    label={t("adminListingSources.filters.operatorPartyId")}
                    register={form.register}
                />
                <div className="grid gap-2">
                    <Label htmlFor="admin-listing-sources-method">
                        {t("adminListingSources.filters.ingestionMethod")}
                    </Label>
                    <Select
                        value={ingestionMethod.value || "all"}
                        onValueChange={(value) =>
                            ingestionMethod.onChange(value === "all" ? "" : value)
                        }
                    >
                        <SelectTrigger id="admin-listing-sources-method">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("adminListingSources.filters.allMethods")}
                            </SelectItem>
                            {ADMIN_LISTING_SOURCE_INGESTION_METHODS.map((method) => (
                                <SelectItem key={method} value={method}>
                                    {t(`adminListingSources.methods.${method}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid gap-2">
                    <Label htmlFor="admin-listing-sources-sort">
                        {t("adminListingSources.filters.sort")}
                    </Label>
                    <Select value={sortOption.value} onValueChange={sortOption.onChange}>
                        <SelectTrigger id="admin-listing-sources-sort" className="min-w-56">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {t(`adminListingSources.sort.${option.replace(":", "_")}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            const defaults = toFilterValues({});
                            form.reset(defaults);
                            onApply(toFilters(defaults));
                        }}
                    >
                        {t("adminListingSources.filters.reset")}
                    </Button>
                    <Button type="submit">{t("adminListingSources.filters.apply")}</Button>
                </div>
            </div>
        </form>
    );
}

function SourceTextFilter({
    id,
    name,
    label,
    register,
}: {
    readonly id: string;
    readonly name: "query" | "name" | "listingSourceId" | "listingSourceSlugId" | "operatorPartyId";
    readonly label: string;
    readonly register: UseFormRegister<FilterValues>;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type="search" autoComplete="off" {...register(name)} />
        </div>
    );
}
