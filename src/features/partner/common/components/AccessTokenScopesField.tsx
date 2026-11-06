import { Info } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
    ACCESS_TOKEN_SCOPE_METADATA,
    ACCESS_TOKEN_SCOPES,
    type AccessTokenScope,
    accessTokenScopeGroupsFor,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";

interface AccessTokenScopesFieldProps {
    readonly value: readonly AccessTokenScope[];
    readonly onChange: (value: AccessTokenScope[]) => void;
    readonly disabled?: boolean;
}

/**
 * Scope selection shared by the create and edit access-token dialogs (design board "Partner ·
 * Access tokens — permissions select all"). Administrator-only scopes are offered to
 * administrators only. Scopes the account cannot see stay in the value untouched, so editing a
 * token never silently drops a grant it already holds.
 */
export function AccessTokenScopesField({
    value,
    onChange,
    disabled = false,
}: AccessTokenScopesFieldProps) {
    const { t } = useTranslation();
    const idPrefix = useId();
    const { data: userAccount, isPending: isRolePending } = useUserAccount();
    const isAdministrator = userAccount?.role === "ADMIN";
    // Until the role is known an administrator would see too few scopes; keep the bulk actions
    // locked so "select all" never means less than it says.
    const bulkDisabled = disabled || isRolePending;
    const groups = accessTokenScopeGroupsFor(isAdministrator);
    const visibleScopes = new Set<AccessTokenScope>(groups.flatMap((group) => group.scopes));
    const selected = new Set<AccessTokenScope>(value);
    const selectedVisibleCount = [...visibleScopes].filter((scope) => selected.has(scope)).length;
    const allSelected = visibleScopes.size > 0 && selectedVisibleCount === visibleScopes.size;
    let masterChecked: boolean | "indeterminate" = false;
    if (allSelected) {
        masterChecked = true;
    } else if (selectedVisibleCount > 0) {
        masterChecked = "indeterminate";
    }
    const masterId = `${idPrefix}-all`;
    const countId = `${idPrefix}-count`;

    /**
     * Emits the selection in catalogue order, keeping scopes this account cannot see and any scope
     * the backend returned that this client does not know yet.
     */
    const emit = (next: ReadonlySet<AccessTokenScope>) => {
        const catalogue = new Set<AccessTokenScope>(ACCESS_TOKEN_SCOPES);
        onChange([
            ...ACCESS_TOKEN_SCOPES.filter((scope) => next.has(scope)),
            ...[...next].filter((scope) => !catalogue.has(scope)),
        ]);
    };
    const setScopes = (scopes: readonly AccessTokenScope[], checked: boolean) => {
        const next = new Set(selected);
        for (const scope of scopes) {
            if (checked) {
                next.add(scope);
            } else {
                next.delete(scope);
            }
        }
        emit(next);
    };

    return (
        <fieldset className="group/scopes grid min-w-0 gap-3" disabled={disabled}>
            <legend className="mb-1.5 text-sm font-medium">
                {t("partnerAccessTokens.create.fields.scopes")}
            </legend>
            <p className="text-sm text-ink-muted">
                {t("partnerAccessTokens.create.fields.scopesHint")}
            </p>

            <div className="grid gap-2 rounded-md bg-surface-sunken px-3.5 py-3">
                <div className="flex flex-wrap items-center gap-3">
                    <Checkbox
                        id={masterId}
                        aria-describedby={countId}
                        disabled={bulkDisabled}
                        checked={masterChecked}
                        onCheckedChange={() => setScopes([...visibleScopes], !allSelected)}
                    />
                    <label
                        htmlFor={masterId}
                        className="min-w-0 flex-1 cursor-pointer text-sm font-medium group-disabled/scopes:cursor-not-allowed"
                    >
                        {t("partnerAccessTokens.scopeSelection.selectAll")}
                    </label>
                    <span
                        id={countId}
                        aria-live="polite"
                        className="font-mono text-tag uppercase text-ink-muted tabular-nums"
                    >
                        {t("partnerAccessTokens.scopeSelection.selectedCount", {
                            count: selectedVisibleCount,
                            total: visibleScopes.size,
                        })}
                    </span>
                </div>
                {allSelected && (
                    <p className="flex items-start gap-2 pl-7 text-meta text-ink-secondary">
                        <Info className="mt-0.5 size-3.5 shrink-0 text-ink-muted" aria-hidden />
                        {t("partnerAccessTokens.scopeSelection.allSelectedNote")}
                    </p>
                )}
            </div>

            {groups.map((group) => {
                const groupLabel = t(
                    isAdministrator && group.administratorLabel
                        ? group.administratorLabel
                        : group.label,
                );
                const groupSelectedCount = group.scopes.filter((scope) =>
                    selected.has(scope),
                ).length;
                const groupFull = groupSelectedCount === group.scopes.length;

                return (
                    <fieldset key={group.label} className="grid min-w-0">
                        <legend className="sr-only">{groupLabel}</legend>
                        <div className="flex min-h-10 flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-line pt-2">
                            <span
                                aria-hidden
                                className="min-w-0 flex-1 font-mono text-tag uppercase tracking-[0.14em] text-ink-muted"
                            >
                                {groupLabel}
                            </span>
                            <span className="font-mono text-tag text-ink-muted tabular-nums">
                                {groupSelectedCount} / {group.scopes.length}
                            </span>
                            <button
                                type="button"
                                disabled={bulkDisabled}
                                aria-label={t(
                                    groupFull
                                        ? "partnerAccessTokens.scopeSelection.groupClearLabel"
                                        : "partnerAccessTokens.scopeSelection.groupSelectAllLabel",
                                    { group: groupLabel },
                                )}
                                onClick={() => setScopes(group.scopes, !groupFull)}
                                className="min-h-8 cursor-pointer text-meta font-medium text-ink underline decoration-line-strong underline-offset-[3px] hover:decoration-ink disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t(
                                    groupFull
                                        ? "partnerAccessTokens.scopeSelection.groupClear"
                                        : "partnerAccessTokens.scopeSelection.groupSelectAll",
                                )}
                            </button>
                        </div>
                        <ul>
                            {group.scopes.map((scope) => {
                                const inputId = `${idPrefix}-${scope}`;
                                const descriptionId = `${idPrefix}-${scope}-description`;

                                return (
                                    <li
                                        key={scope}
                                        className="flex items-start gap-3 rounded-sm border-b border-line-subtle px-1.5 py-3 hover:bg-surface-sunken group-disabled/scopes:hover:bg-transparent"
                                    >
                                        <Checkbox
                                            id={inputId}
                                            className="mt-0.5"
                                            aria-describedby={descriptionId}
                                            disabled={disabled}
                                            checked={selected.has(scope)}
                                            onCheckedChange={(nextChecked) =>
                                                setScopes([scope], nextChecked === true)
                                            }
                                        />
                                        <div className="grid min-w-0 gap-1">
                                            <label
                                                htmlFor={inputId}
                                                className="cursor-pointer text-sm font-medium leading-snug group-disabled/scopes:cursor-not-allowed"
                                            >
                                                {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
                                            </label>
                                            <p
                                                id={descriptionId}
                                                className="text-xs text-ink-muted"
                                            >
                                                {t(ACCESS_TOKEN_SCOPE_METADATA[scope].description)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </fieldset>
                );
            })}
        </fieldset>
    );
}
