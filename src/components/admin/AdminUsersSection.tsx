import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { Mail, Search, Shield, UserRound } from "lucide-react";
import { H1 } from "@/components/typography/H1.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { AdminUserDetailDialog } from "@/components/admin/AdminUserDetailDialog.tsx";
import { USER_TIERS, type AdminUser, type UserTier } from "@/data/internal/admin/AdminUser.ts";
import { USER_ROLES, type UserRole } from "@/data/internal/account/UserRole.ts";
import { useAdminUsers, type AdminUserFilters } from "@/hooks/admin/useAdminUsers.ts";
import { formatShortDate } from "@/lib/utils.ts";

interface AdminUsersSectionProps {
    readonly selectedUserId?: string;
    readonly onSelectedUserIdChange: (userId?: string) => void;
}

type SortMode = "updated-desc" | "created-desc" | "email-asc" | "tier-asc" | "role-asc";

const SORT_MODE_CONFIG: Record<SortMode, Pick<AdminUserFilters, "sort" | "order">> = {
    "updated-desc": { sort: "updated", order: "desc" },
    "created-desc": { sort: "created", order: "desc" },
    "email-asc": { sort: "email", order: "asc" },
    "tier-asc": { sort: "tier", order: "asc" },
    "role-asc": { sort: "role", order: "asc" },
};

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
    const [queryInput, setQueryInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [appliedQuery, setAppliedQuery] = useState("");
    const [appliedEmail, setAppliedEmail] = useState("");
    const [appliedName, setAppliedName] = useState("");
    const [tierFilter, setTierFilter] = useState<UserTier | "ALL">("ALL");
    const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
    const [sortMode, setSortMode] = useState<SortMode>("updated-desc");
    const { ref: loadMoreRef, inView } = useInView();

    const filters = useMemo<AdminUserFilters>(() => {
        const [firstName, ...lastNameParts] = appliedName.split(/\s+/).filter(Boolean);
        const lastName = lastNameParts.join(" ");
        return {
            query: appliedQuery || undefined,
            email: appliedEmail || undefined,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            tier: tierFilter === "ALL" ? undefined : [tierFilter],
            role: roleFilter === "ALL" ? undefined : [roleFilter],
            ...SORT_MODE_CONFIG[sortMode],
        };
    }, [appliedQuery, appliedEmail, appliedName, tierFilter, roleFilter, sortMode]);

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

            <form
                className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                onSubmit={(event) => {
                    event.preventDefault();
                    setAppliedQuery(queryInput.trim());
                    setAppliedEmail(emailInput.trim());
                    setAppliedName(nameInput.trim());
                }}
            >
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={queryInput}
                        onChange={(event) => setQueryInput(event.target.value)}
                        placeholder={t("adminDashboard.users.searchPlaceholder")}
                        aria-label={t("adminDashboard.users.searchPlaceholder")}
                        className="pl-8"
                    />
                </div>
                <Input
                    type="search"
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    placeholder={t("adminDashboard.users.emailSearchPlaceholder")}
                    aria-label={t("adminDashboard.users.emailSearchPlaceholder")}
                />
                <Input
                    type="search"
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    placeholder={t("adminDashboard.users.nameSearchPlaceholder")}
                    aria-label={t("adminDashboard.users.nameSearchPlaceholder")}
                />
                <Button type="submit">{t("adminDashboard.users.search")}</Button>
            </form>

            <div className="flex flex-wrap gap-2">
                <Select
                    value={tierFilter}
                    onValueChange={(value) => setTierFilter(value as UserTier | "ALL")}
                >
                    <SelectTrigger
                        className="w-full sm:w-44"
                        aria-label={t("adminDashboard.users.fields.tier")}
                    >
                        <SelectValue />
                    </SelectTrigger>
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
                <Select
                    value={roleFilter}
                    onValueChange={(value) => setRoleFilter(value as UserRole | "ALL")}
                >
                    <SelectTrigger
                        className="w-full sm:w-44"
                        aria-label={t("adminDashboard.users.fields.role")}
                    >
                        <SelectValue />
                    </SelectTrigger>
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
                <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
                    <SelectTrigger
                        className="w-full sm:w-52"
                        aria-label={t("adminDashboard.users.sort.label")}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.keys(SORT_MODE_CONFIG) as SortMode[]).map((mode) => (
                            <SelectItem key={mode} value={mode}>
                                {t(`adminDashboard.users.sort.${mode}`)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

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
                                        {user.prohibitedContentConsent && (
                                            <span className="flex items-center gap-1">
                                                <Shield className="h-3 w-3" aria-hidden="true" />
                                                {t("adminDashboard.users.prohibitedContentAllowed")}
                                            </span>
                                        )}
                                    </div>
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
                open={selectedUserId !== undefined}
                onOpenChange={(open) => {
                    if (!open) onSelectedUserIdChange(undefined);
                }}
            />
        </section>
    );
}
