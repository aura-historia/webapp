import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    ADMIN_USER_ROLES,
    ADMIN_USER_SORT_FIELDS,
    ADMIN_USER_TIERS,
    DEFAULT_ADMIN_USER_FILTERS,
    isAdminUserCalendarDay,
    type AdminUserFilters,
} from "../lib/adminUserSearch.ts";

const filterSchema = z
    .object({
        query: z.string(),
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        tier: z.array(z.enum(ADMIN_USER_TIERS)),
        role: z.array(z.enum(ADMIN_USER_ROLES)),
        createdFrom: z.string().refine((value) => !value || isAdminUserCalendarDay(value), {
            message: "adminUsers.validation.invalidDate",
        }),
        createdTo: z.string().refine((value) => !value || isAdminUserCalendarDay(value), {
            message: "adminUsers.validation.invalidDate",
        }),
        updatedFrom: z.string().refine((value) => !value || isAdminUserCalendarDay(value), {
            message: "adminUsers.validation.invalidDate",
        }),
        updatedTo: z.string().refine((value) => !value || isAdminUserCalendarDay(value), {
            message: "adminUsers.validation.invalidDate",
        }),
        sort: z.enum(ADMIN_USER_SORT_FIELDS),
        order: z.enum(["asc", "desc"]),
    })
    .superRefine((values, context) => {
        if (values.createdFrom && values.createdTo && values.createdFrom > values.createdTo) {
            context.addIssue({
                code: "custom",
                path: ["createdTo"],
                message: "adminUsers.validation.invalidRange",
            });
        }
        if (values.updatedFrom && values.updatedTo && values.updatedFrom > values.updatedTo) {
            context.addIssue({
                code: "custom",
                path: ["updatedTo"],
                message: "adminUsers.validation.invalidRange",
            });
        }
    });

type FilterValues = z.infer<typeof filterSchema>;

function toFilterValues(filters: AdminUserFilters): FilterValues {
    return {
        query: filters.query ?? "",
        email: filters.email ?? "",
        firstName: filters.firstName ?? "",
        lastName: filters.lastName ?? "",
        tier: [...(filters.tier ?? [])],
        role: [...(filters.role ?? [])],
        createdFrom: filters.createdFrom ?? "",
        createdTo: filters.createdTo ?? "",
        updatedFrom: filters.updatedFrom ?? "",
        updatedTo: filters.updatedTo ?? "",
        sort: filters.sort,
        order: filters.order,
    };
}

function toFilters(values: FilterValues): AdminUserFilters {
    return {
        query: values.query.trim() || undefined,
        email: values.email.trim() || undefined,
        firstName: values.firstName.trim() || undefined,
        lastName: values.lastName.trim() || undefined,
        tier: values.tier.length > 0 ? values.tier : undefined,
        role: values.role.length > 0 ? values.role : undefined,
        createdFrom: values.createdFrom || undefined,
        createdTo: values.createdTo || undefined,
        updatedFrom: values.updatedFrom || undefined,
        updatedTo: values.updatedTo || undefined,
        sort: values.sort,
        order: values.order,
    };
}

export function AdminUserFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminUserFilters;
    readonly onApply: (filters: AdminUserFilters) => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FilterValues>({
        resolver: zodResolver(filterSchema),
        defaultValues: toFilterValues(filters),
    });
    const sortField = useController({ control: form.control, name: "sort" }).field;
    const orderField = useController({ control: form.control, name: "order" }).field;
    const tierField = useController({ control: form.control, name: "tier" }).field;
    const roleField = useController({ control: form.control, name: "role" }).field;

    const submit = (values: FilterValues) => onApply(toFilters(values));
    const dateFilters = [
        ["createdFrom", "admin-users-created-from"],
        ["createdTo", "admin-users-created-to"],
        ["updatedFrom", "admin-users-updated-from"],
        ["updatedTo", "admin-users-updated-to"],
    ] as const;

    return (
        <form
            noValidate
            onSubmit={form.handleSubmit(submit)}
            className="grid gap-5 border bg-surface-container-low p-4"
            aria-label={t("adminUsers.filters.title")}
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <UserTextFilter
                    id="admin-users-query"
                    name="query"
                    label={t("adminUsers.filters.query")}
                    register={form.register}
                />
                <UserTextFilter
                    id="admin-users-email"
                    name="email"
                    label={t("adminUsers.filters.email")}
                    register={form.register}
                    inputMode="email"
                />
                <UserTextFilter
                    id="admin-users-first-name"
                    name="firstName"
                    label={t("adminUsers.filters.firstName")}
                    register={form.register}
                />
                <UserTextFilter
                    id="admin-users-last-name"
                    name="lastName"
                    label={t("adminUsers.filters.lastName")}
                    register={form.register}
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <fieldset className="grid gap-2">
                    <legend className="text-sm font-medium">{t("adminUsers.filters.tier")}</legend>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {ADMIN_USER_TIERS.map((tier) => (
                            <label key={tier} className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={tierField.value.includes(tier)}
                                    onChange={(event) =>
                                        tierField.onChange(
                                            event.target.checked
                                                ? [...tierField.value, tier]
                                                : tierField.value.filter((value) => value !== tier),
                                        )
                                    }
                                />
                                {t(`adminUsers.options.tiers.${tier}`)}
                            </label>
                        ))}
                    </div>
                </fieldset>
                <fieldset className="grid gap-2">
                    <legend className="text-sm font-medium">{t("adminUsers.filters.role")}</legend>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {ADMIN_USER_ROLES.map((role) => (
                            <label key={role} className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={roleField.value.includes(role)}
                                    onChange={(event) =>
                                        roleField.onChange(
                                            event.target.checked
                                                ? [...roleField.value, role]
                                                : roleField.value.filter((value) => value !== role),
                                        )
                                    }
                                />
                                {t(`adminUsers.options.roles.${role}`)}
                            </label>
                        ))}
                    </div>
                </fieldset>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {dateFilters.map(([key, id]) => {
                    const error = form.formState.errors[key];
                    return (
                        <div key={key} className="grid gap-2">
                            <Label htmlFor={id}>{t(`adminUsers.filters.${key}`)}</Label>
                            <Input
                                id={id}
                                type="date"
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? `${id}-error` : undefined}
                                {...form.register(key)}
                            />
                            {error && (
                                <p
                                    id={`${id}-error`}
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {t(error.message ?? "adminUsers.validation.invalidDate")}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-users-sort">{t("adminUsers.filters.sort")}</Label>
                        <select
                            id="admin-users-sort"
                            className="h-9 min-w-56 border bg-background px-3 text-sm"
                            value={sortField.value}
                            onChange={sortField.onChange}
                        >
                            {ADMIN_USER_SORT_FIELDS.map((field) => (
                                <option key={field} value={field}>
                                    {t(`adminUsers.sort.${field}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="admin-users-order">{t("adminUsers.filters.order")}</Label>
                        <select
                            id="admin-users-order"
                            className="h-9 border bg-background px-3 text-sm"
                            value={orderField.value}
                            onChange={orderField.onChange}
                        >
                            {(["asc", "desc"] as const).map((order) => (
                                <option key={order} value={order}>
                                    {t(`adminUsers.order.${order}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            const resetValues = toFilterValues(DEFAULT_ADMIN_USER_FILTERS);
                            form.reset(resetValues);
                            onApply(toFilters(resetValues));
                        }}
                    >
                        {t("adminUsers.filters.reset")}
                    </Button>
                    <Button type="submit">{t("adminUsers.filters.apply")}</Button>
                </div>
            </div>
        </form>
    );
}

function UserTextFilter({
    id,
    name,
    label,
    register,
    inputMode,
}: {
    readonly id: string;
    readonly name: "query" | "email" | "firstName" | "lastName";
    readonly label: string;
    readonly register: UseFormRegister<FilterValues>;
    readonly inputMode?: "email";
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type="search" inputMode={inputMode} {...register(name)} />
        </div>
    );
}
