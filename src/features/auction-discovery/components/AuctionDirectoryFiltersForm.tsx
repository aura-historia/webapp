import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm, type UseFormRegisterReturn } from "react-hook-form";
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
    fromAuctionUtcInput,
    type AuctionDirectoryFilters,
} from "@/data/internal/auction/Auction.ts";

const FORMATS = ["LIVE", "TIMED"] as const;
const REPORTED_STATUSES = ["SCHEDULED", "IN_PROGRESS", "ENDED", "POSTPONED", "CANCELLED"] as const;
const TIME_ROLES = ["BIDDING_OPENS", "LIVE_STARTS", "LOTS_BEGIN_CLOSING", "SCHEDULED_END"] as const;
const validUtcInput = (value: string) => {
    if (value === "") return true;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
    const date = new Date(`${value}:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value;
};

const filterSchema = z
    .object({
        listingSourceId: z.string(),
        format: z.enum(["", ...FORMATS]),
        reportedStatus: z.enum(["", ...REPORTED_STATUSES]),
        timeRole: z.enum(["", ...TIME_ROLES]),
        from: z.string().refine(validUtcInput, "auctions.filters.invalidDateTime"),
        to: z.string().refine(validUtcInput, "auctions.filters.invalidDateTime"),
    })
    .superRefine((values, context) => {
        const hasTimeInput = Boolean(values.timeRole || values.from || values.to);
        if (!hasTimeInput) return;
        if (!values.timeRole) {
            context.addIssue({
                code: "custom",
                path: ["timeRole"],
                message: "auctions.filters.timeRoleRequired",
            });
        }
        if (!values.from || !values.to) {
            context.addIssue({
                code: "custom",
                path: [!values.from ? "from" : "to"],
                message: "auctions.filters.completeRangeRequired",
            });
        }
    });

type FilterValues = z.infer<typeof filterSchema>;

function toFilterValues(filters: AuctionDirectoryFilters): FilterValues {
    return {
        listingSourceId: filters.listingSourceId ?? "",
        format: filters.format ?? "",
        reportedStatus: filters.reportedStatus ?? "",
        timeRole: filters.timeRole ?? "",
        from: filters.from ? filters.from.slice(0, 16) : "",
        to: filters.to ? filters.to.slice(0, 16) : "",
    };
}

function toFilters(values: FilterValues): AuctionDirectoryFilters {
    return {
        ...(values.listingSourceId.trim() && { listingSourceId: values.listingSourceId.trim() }),
        ...(values.format && { format: values.format }),
        ...(values.reportedStatus && { reportedStatus: values.reportedStatus }),
        ...(values.timeRole && {
            timeRole: values.timeRole,
            from: fromAuctionUtcInput(values.from) ?? undefined,
            to: fromAuctionUtcInput(values.to) ?? undefined,
        }),
    };
}

export function AuctionDirectoryFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AuctionDirectoryFilters;
    readonly onApply: (filters: AuctionDirectoryFilters) => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: toFilterValues(filters),
    });
    const format = useController({ control: form.control, name: "format" }).field;
    const status = useController({ control: form.control, name: "reportedStatus" }).field;
    const timeRole = useController({ control: form.control, name: "timeRole" }).field;

    return (
        <form
            onSubmit={form.handleSubmit((values) => onApply(toFilters(values)))}
            className="grid gap-4 border bg-surface-container-low p-4"
            aria-label={t("auctions.filters.title")}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="auction-filter-source-id">
                        {t("auctions.filters.listingSourceId")}
                    </Label>
                    <Input id="auction-filter-source-id" {...form.register("listingSourceId")} />
                </div>
                <FilterSelect
                    id="auction-filter-format"
                    label={t("auctions.filters.format")}
                    value={format.value}
                    onChange={format.onChange}
                    values={FORMATS.map(
                        (value) => [value, t(`auctions.formats.${value}`)] as const,
                    )}
                />
                <FilterSelect
                    id="auction-filter-status"
                    label={t("auctions.filters.reportedStatus")}
                    value={status.value}
                    onChange={status.onChange}
                    values={REPORTED_STATUSES.map(
                        (value) => [value, t(`auctions.reportedStatuses.${value}`)] as const,
                    )}
                />
            </div>
            <fieldset className="grid gap-3 border p-4">
                <legend className="px-1 font-medium">{t("auctions.filters.exactTime")}</legend>
                <p className="text-sm text-muted-foreground">
                    {t("auctions.filters.exactTimeHelp")}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                    <FilterSelect
                        id="auction-filter-time-role"
                        label={t("auctions.filters.timeRole")}
                        value={timeRole.value}
                        onChange={timeRole.onChange}
                        values={TIME_ROLES.map(
                            (value) => [value, t(`auctions.schedule.${camelRole(value)}`)] as const,
                        )}
                        error={form.formState.errors.timeRole?.message}
                    />
                    <UtcFilterField
                        id="auction-filter-from"
                        label={t("auctions.filters.from")}
                        register={form.register("from")}
                        error={form.formState.errors.from?.message}
                    />
                    <UtcFilterField
                        id="auction-filter-to"
                        label={t("auctions.filters.to")}
                        register={form.register("to")}
                        error={form.formState.errors.to?.message}
                    />
                </div>
            </fieldset>
            <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        const empty = toFilterValues({});
                        form.reset(empty);
                        onApply({});
                    }}
                >
                    {t("auctions.filters.clear")}
                </Button>
                <Button type="submit">{t("auctions.filters.apply")}</Button>
            </div>
        </form>
    );
}

function camelRole(value: (typeof TIME_ROLES)[number]) {
    return value
        .toLowerCase()
        .replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function FilterSelect({
    id,
    label,
    value,
    onChange,
    values,
    error,
}: {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly values: readonly (readonly [string, string])[];
    readonly error?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Select
                value={value || "any"}
                onValueChange={(next) => onChange(next === "any" ? "" : next)}
            >
                <SelectTrigger id={id}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">{t("auctions.filters.any")}</SelectItem>
                    {values.map(([option, title]) => (
                        <SelectItem key={option} value={option}>
                            {title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {t(error)}
                </p>
            )}
        </div>
    );
}

function UtcFilterField({
    id,
    label,
    register,
    error,
}: {
    readonly id: string;
    readonly label: string;
    readonly register: UseFormRegisterReturn;
    readonly error?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type="datetime-local" step={60} {...register} />
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {t(error)}
                </p>
            )}
        </div>
    );
}
