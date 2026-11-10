import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { AdminUserSummary } from "@/data/internal/admin/AdminUser.ts";
import {
    AdminCell,
    AdminLedger,
    AdminLedgerRow,
    AdminLedgerSkeleton,
    AdminLoadMore,
    AdminPrimaryCell,
    AdminResultLine,
    AdminRowChevron,
    AdminSortSelect,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminPageHeader } from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import {
    ADMIN_STRONG_TAG_CLASS,
    ADMIN_TAG_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useAdminUsers } from "../api/useAdminUsers.ts";
import { AdminUserDetailDialog } from "../components/AdminUserDetailDialog.tsx";
import { adminUserDisplayName } from "../components/AdminUserPicker.tsx";
import { AdminUserSecurityControls } from "../components/AdminUserSecurityControls.tsx";
import { AdminUserToolbar } from "../components/AdminUserToolbar.tsx";
import {
    ADMIN_USER_SORT_OPTIONS,
    type AdminUserFilters,
    clearAdminUserFilters,
    findAdminUserSortOption,
    hasActiveAdminUserFilters,
} from "../lib/adminUserSearch.ts";

const LEDGER_COLUMNS = "minmax(0,2.4fr) minmax(0,1fr) minmax(0,1fr) 16px";

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
    const { t, i18n } = useTranslation();
    const users = useAdminUsers(filters);
    const pages = users.data?.pages ?? [];
    const summaries = pages.flatMap((page) => page.items);
    const total = pages[0]?.total;
    const filtered = hasActiveAdminUserFilters(filters);
    const number = new Intl.NumberFormat(i18n.language);

    const sortOptions = ADMIN_USER_SORT_OPTIONS.map((option) => ({
        value: option.value,
        label: `${t(`adminUsers.sort.${option.sort}`)} · ${t(`adminUsers.order.${option.direction}`)}`,
    }));
    const resetFilters = () => onFiltersChange(clearAdminUserFilters(filters));

    let content: ReactNode;
    if (summaries.length > 0) {
        content = (
            <>
                <AdminResultLine
                    summary={
                        total === undefined
                            ? t("adminCommon.result.loaded", {
                                  loaded: number.format(summaries.length),
                              })
                            : t("adminCommon.result.loadedOfTotal", {
                                  loaded: number.format(summaries.length),
                                  total: number.format(total),
                              })
                    }
                    sort={
                        <AdminSortSelect
                            value={`${filters.sort}:${filters.order}`}
                            options={sortOptions}
                            onChange={(value) => {
                                const option = findAdminUserSortOption(value);
                                if (option) {
                                    onFiltersChange({
                                        ...filters,
                                        sort: option.sort,
                                        order: option.order,
                                    });
                                }
                            }}
                        />
                    }
                />
                <AdminLedger
                    label={t("adminUsers.list.label")}
                    columns={LEDGER_COLUMNS}
                    headings={[
                        t("adminUsers.columns.account"),
                        t("adminUsers.filters.role"),
                        t("adminUsers.filters.tierShort"),
                    ]}
                >
                    {summaries.map((summary) => (
                        <AdminUserRow
                            key={summary.userId}
                            summary={summary}
                            selected={summary.userId === selectedUserId}
                            onSelect={onUserSelect}
                        />
                    ))}
                </AdminLedger>
                <AdminLoadMore
                    hasNextPage={users.hasNextPage}
                    isFetchingNextPage={users.isFetchingNextPage}
                    isError={users.isFetchNextPageError}
                    onLoadMore={() => void users.fetchNextPage()}
                    label={t("adminUsers.list.loadMoreUsers")}
                />
            </>
        );
    } else if (users.isError) {
        content = (
            <AdminStatePanel tone="error" title={t("adminUsers.loadFailed")}>
                <button
                    type="button"
                    onClick={() => void users.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else if (users.data) {
        content = filtered ? (
            <AdminStatePanel tone="empty" title={t("adminUsers.noMatches")}>
                <button type="button" onClick={resetFilters} className={SECONDARY_PILL_CLASS}>
                    {t("adminCommon.filters.clearSearch")}
                </button>
            </AdminStatePanel>
        ) : (
            <AdminStatePanel tone="empty" title={t("adminUsers.noUsers")} />
        );
    } else {
        content = <AdminLedgerSkeleton label={t("adminUsers.loading")} />;
    }

    return (
        <>
            <AdminPageHeader title={t("adminUsers.pageTitle")} />
            <AdminUserToolbar filters={filters} onFiltersChange={onFiltersChange} />
            {content}
            <AdminUserDetailDialog
                userId={selectedUserId}
                onOpenChange={onDetailOpenChange}
                renderSecurityActions={(userId) => (
                    <AdminUserSecurityControls key={userId} userId={userId} />
                )}
            />
        </>
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
    const name = adminUserDisplayName(summary);
    const hasName = name !== summary.email;

    return (
        <AdminLedgerRow
            selected={selected}
            aria-label={t("adminUsers.list.openUser", { email: summary.email })}
            onClick={() => onSelect(summary.userId)}
        >
            <AdminPrimaryCell title={name} sub={hasName ? summary.email : undefined} />
            <AdminCell head={t("adminUsers.filters.role")}>
                <span
                    className={summary.role === "ADMIN" ? ADMIN_STRONG_TAG_CLASS : ADMIN_TAG_CLASS}
                >
                    {t(`adminUsers.options.roles.${summary.role}`)}
                </span>
            </AdminCell>
            <AdminCell head={t("adminUsers.filters.tierShort")}>
                <span className={ADMIN_TAG_CLASS}>
                    {t(`adminUsers.options.tiers.${summary.tier.toUpperCase()}`)}
                </span>
            </AdminCell>
            <AdminRowChevron />
        </AdminLedgerRow>
    );
}
