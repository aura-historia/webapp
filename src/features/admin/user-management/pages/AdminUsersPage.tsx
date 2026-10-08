import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { AdminUserSummary } from "@/data/internal/admin/AdminUser.ts";
import type { AdminUserFilters } from "../lib/adminUserSearch.ts";
import { useAdminUsers } from "../api/useAdminUsers.ts";
import { AdminUserDetailDialog } from "../components/AdminUserDetailDialog.tsx";
import { AdminUserFiltersForm } from "../components/AdminUserFiltersForm.tsx";

export function AdminUsersPage({
    filters,
    selectedUserId,
    onFiltersChange,
    onUserSelect,
    onDetailOpenChange,
}: {
    readonly filters: AdminUserFilters;
    readonly selectedUserId?: string;
    readonly onFiltersChange: (filters: AdminUserFilters) => void;
    readonly onUserSelect: (userId: string) => void;
    readonly onDetailOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const users = useAdminUsers(filters);
    const pages = users.data?.pages ?? [];
    const summaries = pages.flatMap((page) => page.items);
    const total = pages[0]?.total;

    return (
        <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
            <header className="grid gap-2">
                <H1>{t("adminUsers.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">{t("adminUsers.description")}</p>
            </header>

            <AdminUserFiltersForm
                key={JSON.stringify(filters)}
                filters={filters}
                onApply={onFiltersChange}
            />

            <section className="grid gap-4" aria-label={t("adminUsers.list.title")}>
                {users.isLoading && (
                    <div className="flex justify-center py-12" role="status" aria-live="polite">
                        <span className="sr-only">{t("adminUsers.loading")}</span>
                        <Spinner />
                    </div>
                )}
                {users.isError && (
                    <div className="grid gap-3 border p-4" role="alert">
                        <p className="text-sm text-destructive">{users.error.message}</p>
                        <div>
                            <Button variant="outline" onClick={() => void users.refetch()}>
                                {t("adminUsers.actions.retry")}
                            </Button>
                        </div>
                    </div>
                )}
                {users.data && summaries.length === 0 && (
                    <p className="border p-6 text-center text-muted-foreground">
                        {t("adminUsers.empty")}
                    </p>
                )}
                {summaries.length > 0 && (
                    <>
                        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-muted-foreground">
                            <p>{t("adminUsers.list.loaded", { count: summaries.length })}</p>
                            {total !== undefined && (
                                <p>{t("adminUsers.list.total", { count: total })}</p>
                            )}
                        </div>
                        <ul className="grid gap-2">
                            {summaries.map((summary) => (
                                <li key={summary.userId}>
                                    <AdminUserRow
                                        summary={summary}
                                        selected={summary.userId === selectedUserId}
                                        onSelect={onUserSelect}
                                    />
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                {users.hasNextPage && (
                    <div>
                        <Button
                            variant="outline"
                            disabled={users.isFetchingNextPage}
                            onClick={() => void users.fetchNextPage()}
                        >
                            {users.isFetchingNextPage
                                ? t("adminUsers.list.loadingMore")
                                : t("adminUsers.list.loadMore")}
                        </Button>
                    </div>
                )}
            </section>

            <AdminUserDetailDialog userId={selectedUserId} onOpenChange={onDetailOpenChange} />
        </main>
    );
}

function AdminUserRow({
    summary,
    selected,
    onSelect,
}: {
    readonly summary: AdminUserSummary;
    readonly selected: boolean;
    readonly onSelect: (userId: string) => void;
}) {
    const { t } = useTranslation();
    const name = [summary.firstName, summary.lastName].filter(Boolean).join(" ");

    return (
        <button
            type="button"
            className={`grid w-full gap-3 border p-4 text-left transition-colors hover:bg-surface-container ${selected ? "border-primary bg-surface-container" : "bg-background"}`}
            aria-label={t("adminUsers.list.openUser", { email: summary.email })}
            onClick={() => onSelect(summary.userId)}
        >
            <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="truncate font-medium">{name || summary.email}</span>
                {name && (
                    <span className="break-all text-sm text-muted-foreground">{summary.email}</span>
                )}
            </span>
            <span className="flex flex-wrap gap-2 text-xs">
                <span className="border px-2 py-1">
                    {t(`adminUsers.options.roles.${summary.role}`)}
                </span>
                <span className="border px-2 py-1">
                    {t(`adminUsers.options.tiers.${summary.tier.toUpperCase()}`)}
                </span>
            </span>
        </button>
    );
}
