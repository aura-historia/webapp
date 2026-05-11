import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { z } from "zod";
import { Mail, Search, Shield, UserRound } from "lucide-react";
import { AdminUserDetailDialog } from "@/components/admin/AdminUserDetailDialog.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { USER_TIERS, type AdminUser, type UserTier } from "@/data/internal/admin/AdminUser.ts";
import { USER_ROLES, type UserRole } from "@/data/internal/account/UserRole.ts";
import { useAdminUsers, type AdminUserFilters } from "@/hooks/admin/useAdminUsers.ts";
import { formatShortDate } from "@/lib/utils.ts";

interface AdminUsersSectionProps {
    readonly selectedUserId?: string;
    readonly onSelectedUserIdChange: (userId?: string) => void;
}

type SortMode = "updated-desc" | "created-desc" | "email-asc" | "tier-asc" | "role-asc";

const SORT_MODES = [
    "updated-desc",
    "created-desc",
    "email-asc",
    "tier-asc",
    "role-asc",
] as const satisfies readonly SortMode[];

const SORT_MODE_CONFIG: Record<SortMode, Pick<AdminUserFilters, "sort" | "order">> = {
    "updated-desc": { sort: "updated", order: "desc" },
    "created-desc": { sort: "created", order: "desc" },
    "email-asc": { sort: "email", order: "asc" },
    "tier-asc": { sort: "tier", order: "asc" },
    "role-asc": { sort: "role", order: "asc" },
};

const DEFAULT_FILTER_VALUES = {
    query: "",
    email: "",
    name: "",
    tierFilter: "ALL" as UserTier | "ALL",
    roleFilter: "ALL" as UserRole | "ALL",
    sortMode: "updated-desc" as SortMode,
};

const adminUsersFilterSchema = z.object({
    query: z.string().trim(),
    email: z.string().trim(),
    name: z.string().trim(),
    tierFilter: z.union([z.literal("ALL"), z.enum(USER_TIERS)]),
    roleFilter: z.union([z.literal("ALL"), z.enum(USER_ROLES)]),
    sortMode: z.enum(SORT_MODES),
});

type AdminUsersFilterFormData = z.infer<typeof adminUsersFilterSchema>;

function displayName(user: AdminUser): string {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || "—";
}

function userBadgeVariant(value: UserRole | UserTier): "default" | "secondary" | "outline" {
    if (value === "ADMIN" || value === "ULTIMATE") return "default";
    if (value === "PRO") return "secondary";
    return "outline";
}

export function AdminUsersSection({
    selectedUserId,
    onSelectedUserIdChange,
}: AdminUsersSectionProps) {
    const { t, i18n } = useTranslation();
    const [submittedSearch, setSubmittedSearch] = useState(() => ({
        query: DEFAULT_FILTER_VALUES.query,
        email: DEFAULT_FILTER_VALUES.email,
        name: DEFAULT_FILTER_VALUES.name,
    }));
    const { ref: loadMoreRef, inView } = useInView();

    const form = useForm<AdminUsersFilterFormData>({
        resolver: zodResolver(adminUsersFilterSchema),
        defaultValues: DEFAULT_FILTER_VALUES,
    });

    const tierFilter = form.watch("tierFilter");
    const roleFilter = form.watch("roleFilter");
    const sortMode = form.watch("sortMode");

    const filters = useMemo<AdminUserFilters>(() => {
        const [firstName, ...lastNameParts] = submittedSearch.name.split(/\s+/).filter(Boolean);
        const lastName = lastNameParts.join(" ");

        return {
            query: submittedSearch.query || undefined,
            email: submittedSearch.email || undefined,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            tier: tierFilter === "ALL" ? undefined : [tierFilter],
            role: roleFilter === "ALL" ? undefined : [roleFilter],
            ...SORT_MODE_CONFIG[sortMode],
        };
    }, [roleFilter, sortMode, submittedSearch, tierFilter]);

    const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useAdminUsers(filters);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const items = data?.pages.flatMap((page) => page.items) ?? [];
    const total = data?.pages[0]?.total;

    return (
        <section className="flex flex-col gap-4">
            <header className="flex flex-col gap-1">
                <H1>{t("adminDashboard.users.title")}</H1>
                <p className="text-base text-muted-foreground">
                    {t("adminDashboard.users.description")}
                </p>
            </header>

            <Form {...form}>
                <form
                    className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                    onSubmit={form.handleSubmit(({ query, email, name }) => {
                        setSubmittedSearch({ query, email, name });
                    })}
                >
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <Search
                                    className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="search"
                                        placeholder={t("adminDashboard.users.searchPlaceholder")}
                                        aria-label={t("adminDashboard.users.searchPlaceholder")}
                                        className="pl-8"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="search"
                                        placeholder={t(
                                            "adminDashboard.users.emailSearchPlaceholder",
                                        )}
                                        aria-label={t(
                                            "adminDashboard.users.emailSearchPlaceholder",
                                        )}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="search"
                                        placeholder={t(
                                            "adminDashboard.users.nameSearchPlaceholder",
                                        )}
                                        aria-label={t("adminDashboard.users.nameSearchPlaceholder")}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit">{t("adminDashboard.users.search")}</Button>
                </form>

                <div className="flex flex-wrap gap-2">
                    <FormField
                        control={form.control}
                        name="tierFilter"
                        render={({ field }) => (
                            <FormItem>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger
                                            className="w-full sm:w-44"
                                            aria-label={t("adminDashboard.users.fields.tier")}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ALL">
                                            {t("adminDashboard.users.filters.allTiers")}
                                        </SelectItem>
                                        {USER_TIERS.map((tier) => (
                                            <SelectItem key={tier} value={tier}>
                                                {tier}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="roleFilter"
                        render={({ field }) => (
                            <FormItem>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger
                                            className="w-full sm:w-44"
                                            aria-label={t("adminDashboard.users.fields.role")}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="ALL">
                                            {t("adminDashboard.users.filters.allRoles")}
                                        </SelectItem>
                                        {USER_ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sortMode"
                        render={({ field }) => (
                            <FormItem>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger
                                            className="w-full sm:w-52"
                                            aria-label={t("adminDashboard.users.sort.label")}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SORT_MODES.map((mode) => (
                                            <SelectItem key={mode} value={mode}>
                                                {t(`adminDashboard.users.sort.${mode}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>
            </Form>

            {isPending ? (
                <div className="flex justify-center py-10" role="status" aria-live="polite">
                    <Spinner />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("adminDashboard.users.loadError")}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        {t("adminDashboard.actions.retry")}
                    </Button>
                </div>
            ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    {t("adminDashboard.users.empty")}
                </p>
            ) : (
                <>
                    {total !== undefined && (
                        <p className="text-xs text-muted-foreground">
                            {t("adminDashboard.users.totalCount", { count: total })}
                        </p>
                    )}
                    <ul className="flex flex-col gap-2">
                        {items.map((user) => (
                            <li key={user.userId}>
                                <button
                                    type="button"
                                    className="flex w-full flex-col gap-2 rounded-md border bg-surface-container-low p-3 text-left transition-colors hover:border-primary"
                                    onClick={() => onSelectedUserIdChange(user.userId)}
                                >
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <UserRound
                                            className="h-4 w-4 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <span className="font-medium">{displayName(user)}</span>
                                        <Badge variant={userBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                        <Badge variant={userBadgeVariant(user.tier)}>
                                            {user.tier}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" aria-hidden="true" />
                                            {user.email}
                                        </span>
                                        {user.stripeCustomerId && (
                                            <span
                                                className="font-mono"
                                                title={user.stripeCustomerId}
                                            >
                                                {user.stripeCustomerId}
                                            </span>
                                        )}
                                        <span>
                                            {t("adminDashboard.users.updatedAt", {
                                                date: formatShortDate(user.updated, i18n.language),
                                            })}
                                        </span>
                                    </div>
                                    {user.prohibitedContentConsent && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Shield className="h-3 w-3" aria-hidden="true" />
                                            {t(
                                                "adminDashboard.users.fields.prohibitedContentConsent",
                                            )}
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {hasNextPage && (
                        <div ref={loadMoreRef} className="flex justify-center py-4">
                            {isFetchingNextPage ? <Spinner /> : null}
                        </div>
                    )}
                </>
            )}

            <AdminUserDetailDialog
                userId={selectedUserId}
                open={Boolean(selectedUserId)}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        onSelectedUserIdChange(undefined);
                    }
                }}
            />
        </section>
    );
}
