import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm, type UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
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
import { LISTING_AVAILABILITY_TRANSLATION_KEYS } from "@/data/internal/product/ListingAvailability.ts";
import {
    ADMIN_PRODUCT_LISTING_AVAILABILITIES,
    ADMIN_PRODUCT_LISTING_LIFECYCLES,
    ADMIN_PRODUCT_LISTING_PAGE_SIZE,
    ADMIN_PRODUCT_LISTING_PAGE_SIZE_OPTIONS,
    ADMIN_PRODUCT_LISTING_SORT_FIELDS,
    type AdminProductListingFilters,
    type AdminProductListingSortField,
    type AdminProductListingSortOrder,
    DEFAULT_ADMIN_PRODUCT_LISTING_SORT,
    isAdminProductListingPageSize,
    isWithinFilterByteLimit,
} from "../lib/adminProductListingSearch.ts";

const SORT_OPTIONS = ADMIN_PRODUCT_LISTING_SORT_FIELDS.flatMap((sort) => [
    `${sort}:desc`,
    `${sort}:asc`,
]) as readonly `${AdminProductListingSortField}:${AdminProductListingSortOrder}`[];
const DEFAULT_SORT_OPTION = `${DEFAULT_ADMIN_PRODUCT_LISTING_SORT.sort}:${DEFAULT_ADMIN_PRODUCT_LISTING_SORT.order}`;
const TOO_LONG = "adminProductListings.validation.filterTooLong";

const filterSchema = z.object({
    query: z.string().refine(isWithinFilterByteLimit, TOO_LONG),
    listingSourceId: z.string(),
    sourceListingId: z.string().refine(isWithinFilterByteLimit, TOO_LONG),
    auctionId: z.string(),
    lifecycle: z.enum(["", ...ADMIN_PRODUCT_LISTING_LIFECYCLES]),
    availability: z.enum(["", ...ADMIN_PRODUCT_LISTING_AVAILABILITIES]),
    sortOption: z.enum(SORT_OPTIONS),
    size: z.string(),
});

type FilterValues = z.infer<typeof filterSchema>;
type TextFilterName = "query" | "listingSourceId" | "sourceListingId" | "auctionId";

function toFilterValues(filters: AdminProductListingFilters): FilterValues {
    return {
        query: filters.query ?? "",
        listingSourceId: filters.listingSourceId ?? "",
        sourceListingId: filters.sourceListingId ?? "",
        auctionId: filters.auctionId ?? "",
        lifecycle: filters.lifecycle ?? "",
        availability: filters.availability ?? "",
        sortOption: (filters.sort && filters.order
            ? `${filters.sort}:${filters.order}`
            : DEFAULT_SORT_OPTION) as FilterValues["sortOption"],
        size: String(filters.size ?? ADMIN_PRODUCT_LISTING_PAGE_SIZE),
    };
}

function toFilters(values: FilterValues): AdminProductListingFilters {
    const [sort, order] = values.sortOption.split(":") as [
        AdminProductListingSortField,
        AdminProductListingSortOrder,
    ];
    const size = Number(values.size);
    const filters: AdminProductListingFilters = {
        query: values.query.trim() || undefined,
        listingSourceId: values.listingSourceId.trim() || undefined,
        sourceListingId: values.sourceListingId.trim() || undefined,
        auctionId: values.auctionId.trim() || undefined,
        lifecycle: values.lifecycle || undefined,
        availability: values.availability || undefined,
        // The default ordering is the API default, so it stays out of the URL and request.
        ...(values.sortOption !== DEFAULT_SORT_OPTION && { sort, order }),
        size:
            isAdminProductListingPageSize(size) && size !== ADMIN_PRODUCT_LISTING_PAGE_SIZE
                ? size
                : undefined,
    };
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined),
    ) as AdminProductListingFilters;
}

export function AdminProductListingFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminProductListingFilters;
    readonly onApply: (filters: AdminProductListingFilters) => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: toFilterValues(filters),
    });
    const lifecycle = useController({ control: form.control, name: "lifecycle" }).field;
    const availability = useController({ control: form.control, name: "availability" }).field;
    const sortOption = useController({ control: form.control, name: "sortOption" }).field;
    const size = useController({ control: form.control, name: "size" }).field;
    const sizeOptions = [
        ...new Set<number>([...ADMIN_PRODUCT_LISTING_PAGE_SIZE_OPTIONS, Number(size.value)]),
    ].sort((a, b) => a - b);

    return (
        <form
            onSubmit={form.handleSubmit((values) => onApply(toFilters(values)))}
            className="grid gap-4 border bg-surface-container-low p-4"
            aria-label={t("adminProductListings.filters.title")}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ListingTextFilter
                    id="admin-product-listings-query"
                    name="query"
                    label={t("adminProductListings.filters.query")}
                    hint={t("adminProductListings.filters.queryHelp")}
                    register={form.register}
                    error={form.formState.errors.query?.message}
                />
                <ListingTextFilter
                    id="admin-product-listings-listing-source-id"
                    name="listingSourceId"
                    label={t("adminProductListings.fields.listingSourceId")}
                    hint={t("adminProductListings.filters.listingSourceIdHelp")}
                    placeholder="ls_…"
                    register={form.register}
                />
                <ListingTextFilter
                    id="admin-product-listings-source-listing-id"
                    name="sourceListingId"
                    label={t("adminProductListings.fields.sourceListingId")}
                    hint={t("adminProductListings.filters.sourceListingIdHelp")}
                    register={form.register}
                    error={form.formState.errors.sourceListingId?.message}
                />
                <ListingTextFilter
                    id="admin-product-listings-auction-id"
                    name="auctionId"
                    label={t("adminProductListings.fields.auctionId")}
                    hint={t("adminProductListings.filters.auctionIdHelp")}
                    placeholder="auc_…"
                    register={form.register}
                />
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-product-listings-lifecycle">
                        {t("adminProductListings.fields.lifecycle")}
                    </Label>
                    <Select
                        value={lifecycle.value || "all"}
                        onValueChange={(value) => lifecycle.onChange(value === "all" ? "" : value)}
                    >
                        <SelectTrigger id="admin-product-listings-lifecycle">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("adminProductListings.filters.allLifecycles")}
                            </SelectItem>
                            {ADMIN_PRODUCT_LISTING_LIFECYCLES.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {t(`adminProductListings.lifecycles.${value}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-product-listings-availability">
                        {t("adminProductListings.fields.availability")}
                    </Label>
                    <Select
                        value={availability.value || "all"}
                        onValueChange={(value) =>
                            availability.onChange(value === "all" ? "" : value)
                        }
                    >
                        <SelectTrigger id="admin-product-listings-availability">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("adminProductListings.filters.allAvailabilities")}
                            </SelectItem>
                            {ADMIN_PRODUCT_LISTING_AVAILABILITIES.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {t(LISTING_AVAILABILITY_TRANSLATION_KEYS[value])}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-product-listings-sort">
                            {t("adminProductListings.filters.sort")}
                        </Label>
                        <Select value={sortOption.value} onValueChange={sortOption.onChange}>
                            <SelectTrigger id="admin-product-listings-sort" className="min-w-56">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {t(`adminProductListings.sort.${option.replace(":", "_")}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="admin-product-listings-size">
                            {t("adminProductListings.filters.pageSize")}
                        </Label>
                        <Select value={size.value} onValueChange={size.onChange}>
                            <SelectTrigger id="admin-product-listings-size" className="min-w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {sizeOptions.map((option) => (
                                    <SelectItem key={option} value={String(option)}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset(toFilterValues({}));
                            onApply({});
                        }}
                    >
                        {t("adminProductListings.filters.reset")}
                    </Button>
                    <Button type="submit">{t("adminProductListings.filters.apply")}</Button>
                </div>
            </div>
        </form>
    );
}

function ListingTextFilter({
    id,
    name,
    label,
    hint,
    placeholder,
    register,
    error,
}: {
    readonly id: string;
    readonly name: TextFilterName;
    readonly label: string;
    readonly hint: string;
    readonly placeholder?: string;
    readonly register: UseFormRegister<FilterValues>;
    readonly error?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder={placeholder}
                aria-describedby={`${id}-hint`}
                aria-invalid={error ? true : undefined}
                {...register(name)}
            />
            <p id={`${id}-hint`} className="text-xs text-muted-foreground">
                {hint}
            </p>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {t(error)}
                </p>
            )}
        </div>
    );
}
