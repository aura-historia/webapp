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
    type AdminPartyFilters,
    type AdminPartySortField,
    type AdminPartySortOrder,
    isPartyCalendarDay,
} from "@/data/internal/party/Party.ts";

const SORT_OPTIONS = [
    "name:asc",
    "name:desc",
    "email:asc",
    "email:desc",
    "phone:asc",
    "phone:desc",
    "created:asc",
    "created:desc",
    "updated:asc",
    "updated:desc",
] as const satisfies readonly `${AdminPartySortField}:${AdminPartySortOrder}`[];
type SortOption = (typeof SORT_OPTIONS)[number];

const filterSchema = z.object({
    query: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    createdFrom: z.string().refine((value) => !value || isPartyCalendarDay(value), {
        message: "adminParties.validation.invalidDate",
    }),
    createdTo: z.string().refine((value) => !value || isPartyCalendarDay(value), {
        message: "adminParties.validation.invalidDate",
    }),
    updatedFrom: z.string().refine((value) => !value || isPartyCalendarDay(value), {
        message: "adminParties.validation.invalidDate",
    }),
    updatedTo: z.string().refine((value) => !value || isPartyCalendarDay(value), {
        message: "adminParties.validation.invalidDate",
    }),
    sortOption: z.enum(SORT_OPTIONS),
});

type FilterValues = z.infer<typeof filterSchema>;

function toFilterValues(filters: AdminPartyFilters): FilterValues {
    return {
        query: filters.query ?? "",
        name: filters.name ?? "",
        phone: filters.phone ?? "",
        email: filters.email ?? "",
        createdFrom: filters.createdFrom ?? "",
        createdTo: filters.createdTo ?? "",
        updatedFrom: filters.updatedFrom ?? "",
        updatedTo: filters.updatedTo ?? "",
        sortOption: `${filters.sort ?? "name"}:${filters.order ?? "asc"}` as SortOption,
    };
}

function toFilters(values: FilterValues): AdminPartyFilters {
    const [sort, order] = values.sortOption.split(":") as [
        AdminPartySortField,
        AdminPartySortOrder,
    ];
    const filters: AdminPartyFilters = {
        query: values.query.trim(),
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        createdFrom: values.createdFrom,
        createdTo: values.createdTo,
        updatedFrom: values.updatedFrom,
        updatedTo: values.updatedTo,
        sort,
        order,
    };
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined),
    ) as AdminPartyFilters;
}

export function AdminPartyFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminPartyFilters;
    readonly onApply: (filters: AdminPartyFilters) => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: toFilterValues(filters),
    });
    const sortField = useController({ control: form.control, name: "sortOption" }).field;

    const submit = (values: FilterValues) => onApply(toFilters(values));

    return (
        <form
            onSubmit={form.handleSubmit(submit)}
            className="grid gap-4 border bg-surface-container-low p-4"
            aria-label={t("adminParties.filters.title")}
        >
            <div className="grid gap-4 md:grid-cols-2">
                <PartyTextFilter
                    id="admin-parties-query"
                    name="query"
                    label={t("adminParties.filters.query")}
                    register={form.register}
                />
                <PartyTextFilter
                    id="admin-parties-name"
                    name="name"
                    label={t("adminParties.filters.name")}
                    register={form.register}
                />
                <PartyTextFilter
                    id="admin-parties-phone"
                    name="phone"
                    label={t("adminParties.filters.phone")}
                    register={form.register}
                    type="tel"
                />
                <PartyTextFilter
                    id="admin-parties-email"
                    name="email"
                    label={t("adminParties.filters.email")}
                    register={form.register}
                    type="email"
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(
                    [
                        ["createdFrom", "admin-parties-created-from"],
                        ["createdTo", "admin-parties-created-to"],
                        ["updatedFrom", "admin-parties-updated-from"],
                        ["updatedTo", "admin-parties-updated-to"],
                    ] as const
                ).map(([key, id]) => (
                    <div key={key} className="grid gap-2">
                        <Label htmlFor={id}>{t(`adminParties.filters.${key}`)}</Label>
                        <Input
                            id={id}
                            type="date"
                            aria-invalid={Boolean(form.formState.errors[key])}
                            aria-describedby={
                                form.formState.errors[key] ? `${id}-error` : undefined
                            }
                            {...form.register(key)}
                        />
                        {form.formState.errors[key] && (
                            <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                                {t(
                                    form.formState.errors[key]?.message ??
                                        "adminParties.validation.invalidDate",
                                )}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid gap-2">
                    <Label htmlFor="admin-parties-sort">{t("adminParties.filters.sort")}</Label>
                    <Select value={sortField.value} onValueChange={sortField.onChange}>
                        <SelectTrigger id="admin-parties-sort" className="min-w-56">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {t(`adminParties.sort.${option.replace(":", "_")}`)}
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
                            const resetValues = toFilterValues({});
                            form.reset(resetValues);
                            onApply(toFilters(resetValues));
                        }}
                    >
                        {t("adminParties.filters.reset")}
                    </Button>
                    <Button type="submit">{t("adminParties.filters.apply")}</Button>
                </div>
            </div>
        </form>
    );
}

function PartyTextFilter({
    id,
    name,
    label,
    register,
    type = "search",
}: {
    readonly id: string;
    readonly name: "query" | "name" | "phone" | "email";
    readonly label: string;
    readonly register: UseFormRegister<FilterValues>;
    readonly type?: "search" | "tel" | "email";
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type={type} autoComplete="off" {...register(name)} />
        </div>
    );
}
