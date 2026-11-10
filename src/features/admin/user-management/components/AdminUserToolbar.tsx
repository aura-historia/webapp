import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type AdminChip,
    AdminActiveChips,
    AdminDateRangeField,
    AdminFilterPanel,
    AdminQuickMulti,
    AdminTextField,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import type { AdminUserRole, AdminUserTier } from "@/data/internal/admin/AdminUser.ts";
import {
    ADMIN_USER_ROLES,
    ADMIN_USER_TIERS,
    type AdminUserFilters,
    clearAdminUserFilters,
    isAdminUserCalendarDay,
} from "../lib/adminUserSearch.ts";

type PanelDraft = {
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly createdFrom: string;
    readonly createdTo: string;
    readonly updatedFrom: string;
    readonly updatedTo: string;
};

const EMPTY_DRAFT: PanelDraft = {
    email: "",
    firstName: "",
    lastName: "",
    createdFrom: "",
    createdTo: "",
    updatedFrom: "",
    updatedTo: "",
};

function toDraft(filters: AdminUserFilters): PanelDraft {
    return {
        email: filters.email ?? "",
        firstName: filters.firstName ?? "",
        lastName: filters.lastName ?? "",
        createdFrom: filters.createdFrom ?? "",
        createdTo: filters.createdTo ?? "",
        updatedFrom: filters.updatedFrom ?? "",
        updatedTo: filters.updatedTo ?? "",
    };
}

function rangeError(from: string, until: string): string | undefined {
    if ((from && !isAdminUserCalendarDay(from)) || (until && !isAdminUserCalendarDay(until))) {
        return "adminUsers.validation.invalidDate";
    }
    if (from && until && from > until) return "adminUsers.validation.invalidRange";
    return undefined;
}

/**
 * The "All filters" panel: text filters and the created/updated day ranges, applied together. Tier
 * and role are quick filters in the toolbar row.
 */
function AdminUserFilterPanel({
    filters,
    onApply,
}: {
    readonly filters: AdminUserFilters;
    readonly onApply: (filters: AdminUserFilters) => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<PanelDraft>(() => toDraft(filters));
    const [errors, setErrors] = useState<{ created?: string; updated?: string }>({});
    const update = (key: keyof PanelDraft) => (value: string) =>
        setDraft((current) => ({ ...current, [key]: value }));

    const apply = () => {
        const next = {
            created: rangeError(draft.createdFrom, draft.createdTo),
            updated: rangeError(draft.updatedFrom, draft.updatedTo),
        };
        setErrors(next);
        if (next.created || next.updated) return false;
        onApply({
            ...filters,
            email: draft.email.trim() || undefined,
            firstName: draft.firstName.trim() || undefined,
            lastName: draft.lastName.trim() || undefined,
            createdFrom: draft.createdFrom || undefined,
            createdTo: draft.createdTo || undefined,
            updatedFrom: draft.updatedFrom || undefined,
            updatedTo: draft.updatedTo || undefined,
        });
    };

    return (
        <AdminFilterPanel
            onApply={apply}
            onReset={() => {
                setDraft(EMPTY_DRAFT);
                setErrors({});
            }}
        >
            <AdminTextField
                label={t("adminUsers.filters.email")}
                value={draft.email}
                onChange={update("email")}
            />
            <AdminTextField
                label={t("adminUsers.filters.firstName")}
                value={draft.firstName}
                onChange={update("firstName")}
            />
            <AdminTextField
                label={t("adminUsers.filters.lastName")}
                value={draft.lastName}
                onChange={update("lastName")}
            />
            <AdminDateRangeField
                legend={t("adminUsers.sort.created")}
                from={draft.createdFrom}
                until={draft.createdTo}
                onFromChange={update("createdFrom")}
                onUntilChange={update("createdTo")}
                error={errors.created && t(errors.created)}
            />
            <AdminDateRangeField
                legend={t("adminUsers.sort.updated")}
                from={draft.updatedFrom}
                until={draft.updatedTo}
                onFromChange={update("updatedFrom")}
                onUntilChange={update("updatedTo")}
                error={errors.updated && t(errors.updated)}
            />
        </AdminFilterPanel>
    );
}

/** Search, tier and role quick filters, the full filter panel and a chip for every active filter. */
export function AdminUserToolbar({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminUserFilters;
    readonly onFiltersChange: (filters: AdminUserFilters) => void;
}) {
    const { t } = useTranslation();
    const [query, setQuery] = useState(filters.query ?? "");

    // A chip or "Clear all" can change the applied search; show what is applied.
    useEffect(() => {
        setQuery(filters.query ?? "");
    }, [filters.query]);

    const tierOptions = ADMIN_USER_TIERS.map((tier) => ({
        value: tier,
        label: t(`adminUsers.options.tiers.${tier}`),
    }));
    const roleOptions = ADMIN_USER_ROLES.map((role) => ({
        value: role,
        label: t(`adminUsers.options.roles.${role}`),
    }));
    const change = (patch: Partial<AdminUserFilters>) => onFiltersChange({ ...filters, ...patch });

    const chips: AdminChip[] = [];
    const textChip = (key: keyof AdminUserFilters, labelKey: string, value?: string) => {
        if (value) {
            chips.push({
                key,
                label: `${t(labelKey)}: ${value}`,
                onRemove: () => change({ [key]: undefined }),
            });
        }
    };
    textChip("query", "adminUsers.filters.query", filters.query);
    for (const tier of filters.tier ?? []) {
        chips.push({
            key: `tier:${tier}`,
            label: [t("adminUsers.filters.tierShort"), t(`adminUsers.options.tiers.${tier}`)].join(
                ": ",
            ),
            onRemove: () => {
                const rest = (filters.tier ?? []).filter((value) => value !== tier);
                change({ tier: rest.length > 0 ? rest : undefined });
            },
        });
    }
    for (const role of filters.role ?? []) {
        chips.push({
            key: `role:${role}`,
            label: [t("adminUsers.filters.role"), t(`adminUsers.options.roles.${role}`)].join(": "),
            onRemove: () => {
                const rest = (filters.role ?? []).filter((value) => value !== role);
                change({ role: rest.length > 0 ? rest : undefined });
            },
        });
    }
    textChip("email", "adminUsers.filters.email", filters.email);
    textChip("firstName", "adminUsers.filters.firstName", filters.firstName);
    textChip("lastName", "adminUsers.filters.lastName", filters.lastName);
    textChip("createdFrom", "adminUsers.filters.createdFrom", filters.createdFrom);
    textChip("createdTo", "adminUsers.filters.createdTo", filters.createdTo);
    textChip("updatedFrom", "adminUsers.filters.updatedFrom", filters.updatedFrom);
    textChip("updatedTo", "adminUsers.filters.updatedTo", filters.updatedTo);

    const panelCount = [
        filters.email,
        filters.firstName,
        filters.lastName,
        filters.createdFrom || filters.createdTo,
        filters.updatedFrom || filters.updatedTo,
    ].filter(Boolean).length;

    return (
        <AdminToolbar
            label={t("adminUsers.filters.title")}
            search={{
                label: t("adminUsers.filters.query"),
                value: query,
                onChange: setQuery,
                onSubmit: () => change({ query: query.trim() || undefined }),
            }}
            quickFilters={
                <>
                    <AdminQuickMulti
                        label={t("adminUsers.filters.tierShort")}
                        values={filters.tier ?? []}
                        options={tierOptions}
                        onChange={(values) =>
                            change({
                                tier: values.length > 0 ? (values as AdminUserTier[]) : undefined,
                            })
                        }
                    />
                    <AdminQuickMulti
                        label={t("adminUsers.filters.role")}
                        values={filters.role ?? []}
                        options={roleOptions}
                        onChange={(values) =>
                            change({
                                role: values.length > 0 ? (values as AdminUserRole[]) : undefined,
                            })
                        }
                    />
                </>
            }
            panel={
                <AdminUserFilterPanel
                    filters={filters}
                    onApply={(next) => {
                        onFiltersChange(next);
                    }}
                />
            }
            panelCount={panelCount}
            chips={
                <AdminActiveChips
                    chips={chips}
                    onClearAll={() => onFiltersChange(clearAdminUserFilters(filters))}
                />
            }
        />
    );
}
