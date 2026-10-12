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
import {
    ADMIN_AUCTION_FORMATS,
    ADMIN_AUCTION_PAGE_SIZE,
    ADMIN_AUCTION_PAGE_SIZE_OPTIONS,
    ADMIN_AUCTION_REPORTED_STATUSES,
    ADMIN_AUCTION_SORT_FIELDS,
    DEFAULT_ADMIN_AUCTION_SORT,
    isAdminAuctionPageSize,
    type AdminAuctionFilters,
    type AdminAuctionSortField,
    type AdminAuctionSortOrder,
} from "../lib/adminAuctionSearch.ts";

const SORT_OPTIONS = ADMIN_AUCTION_SORT_FIELDS.flatMap((sort) => [
    `${sort}:desc`,
    `${sort}:asc`,
]) as readonly `${AdminAuctionSortField}:${AdminAuctionSortOrder}`[];
const DEFAULT_SORT_OPTION = `${DEFAULT_ADMIN_AUCTION_SORT.sort}:${DEFAULT_ADMIN_AUCTION_SORT.order}`;

const filterSchema = z.object({
    query: z.string(),
    listingSourceId: z.string(),
    sourceAuctionId: z.string(),
    format: z.enum(["", ...ADMIN_AUCTION_FORMATS]),
    reportedStatus: z.enum(["", ...ADMIN_AUCTION_REPORTED_STATUSES]),
    sortOption: z.enum(SORT_OPTIONS),
    size: z.string(),
});

type FilterValues = z.infer<typeof filterSchema>;
type TextFilterName = "query" | "listingSourceId" | "sourceAuctionId";

function toFilterValues(filters: AdminAuctionFilters): FilterValues {
    return {
        query: filters.query ?? "",
        listingSourceId: filters.listingSourceId ?? "",
        sourceAuctionId: filters.sourceAuctionId ?? "",
        format: filters.format ?? "",
        reportedStatus: filters.reportedStatus ?? "",
        sortOption: (filters.sort && filters.order
            ? `${filters.sort}:${filters.order}`
            : DEFAULT_SORT_OPTION) as FilterValues["sortOption"],
        size: String(filters.size ?? ADMIN_AUCTION_PAGE_SIZE),
    };
}

function toFilters(values: FilterValues): AdminAuctionFilters {
    const [sort, order] = values.sortOption.split(":") as [
        AdminAuctionSortField,
        AdminAuctionSortOrder,
    ];
    const size = Number(values.size);
    const filters: AdminAuctionFilters = {
        query: values.query.trim() || undefined,
        listingSourceId: values.listingSourceId.trim() || undefined,
        sourceAuctionId: values.sourceAuctionId.trim() || undefined,
        format: values.format || undefined,
        reportedStatus: values.reportedStatus || undefined,
        // The default ordering is the API default, so it stays out of the URL and request.
        ...(values.sortOption !== DEFAULT_SORT_OPTION && { sort, order }),
        size: isAdminAuctionPageSize(size) && size !== ADMIN_AUCTION_PAGE_SIZE ? size : undefined,
    };
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined),
    ) as AdminAuctionFilters;
}

export function AdminAuctionFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminAuctionFilters;
    readonly onApply: (filters: AdminAuctionFilters) => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: toFilterValues(filters),
    });
    const format = useController({ control: form.control, name: "format" }).field;
    const reportedStatus = useController({ control: form.control, name: "reportedStatus" }).field;
    const sortOption = useController({ control: form.control, name: "sortOption" }).field;
    const size = useController({ control: form.control, name: "size" }).field;
    const sizeOptions = [
        ...new Set<number>([...ADMIN_AUCTION_PAGE_SIZE_OPTIONS, Number(size.value)]),
    ].sort((a, b) => a - b);

    return (
        <form
            onSubmit={form.handleSubmit((values) => onApply(toFilters(values)))}
            className="grid gap-4 border bg-surface-container-low p-4"
            aria-label={t("adminAuctions.filters.title")}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AuctionTextFilter
                    id="admin-auctions-query"
                    name="query"
                    label={t("adminAuctions.filters.query")}
                    hint={t("adminAuctions.filters.queryHelp")}
                    register={form.register}
                />
                <AuctionTextFilter
                    id="admin-auctions-listing-source-id"
                    name="listingSourceId"
                    label={t("adminAuctions.fields.listingSourceId")}
                    hint={t("adminAuctions.filters.listingSourceIdHelp")}
                    placeholder="ls_…"
                    register={form.register}
                />
                <AuctionTextFilter
                    id="admin-auctions-source-auction-id"
                    name="sourceAuctionId"
                    label={t("adminAuctions.fields.sourceAuctionId")}
                    hint={t("adminAuctions.filters.sourceAuctionIdHelp")}
                    register={form.register}
                />
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-auctions-format">
                        {t("adminAuctions.fields.format")}
                    </Label>
                    <Select
                        value={format.value || "all"}
                        onValueChange={(value) => format.onChange(value === "all" ? "" : value)}
                    >
                        <SelectTrigger id="admin-auctions-format">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("adminAuctions.filters.allFormats")}
                            </SelectItem>
                            {ADMIN_AUCTION_FORMATS.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {t(`adminAuctions.formats.${value}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid content-start gap-2">
                    <Label htmlFor="admin-auctions-status">
                        {t("adminAuctions.fields.reportedStatus")}
                    </Label>
                    <Select
                        value={reportedStatus.value || "all"}
                        onValueChange={(value) =>
                            reportedStatus.onChange(value === "all" ? "" : value)
                        }
                    >
                        <SelectTrigger id="admin-auctions-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("adminAuctions.filters.allStatuses")}
                            </SelectItem>
                            {ADMIN_AUCTION_REPORTED_STATUSES.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {t(`adminAuctions.reportedStatuses.${value}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-auctions-sort">
                            {t("adminAuctions.filters.sort")}
                        </Label>
                        <Select value={sortOption.value} onValueChange={sortOption.onChange}>
                            <SelectTrigger id="admin-auctions-sort" className="min-w-56">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {t(`adminAuctions.sort.${option.replace(":", "_")}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="admin-auctions-size">
                            {t("adminAuctions.filters.pageSize")}
                        </Label>
                        <Select value={size.value} onValueChange={size.onChange}>
                            <SelectTrigger id="admin-auctions-size" className="min-w-24">
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
                        {t("adminAuctions.filters.reset")}
                    </Button>
                    <Button type="submit">{t("adminAuctions.filters.apply")}</Button>
                </div>
            </div>
        </form>
    );
}

function AuctionTextFilter({
    id,
    name,
    label,
    hint,
    placeholder,
    register,
}: {
    readonly id: string;
    readonly name: TextFilterName;
    readonly label: string;
    readonly hint: string;
    readonly placeholder?: string;
    readonly register: UseFormRegister<FilterValues>;
}) {
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
                {...register(name)}
            />
            <p id={`${id}-hint`} className="text-xs text-muted-foreground">
                {hint}
            </p>
        </div>
    );
}
