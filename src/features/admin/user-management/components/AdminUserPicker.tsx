import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminUserSummary } from "@/data/internal/admin/AdminUser.ts";
import { useAdminUsers } from "../api/useAdminUsers.ts";
import { DEFAULT_ADMIN_USER_FILTERS } from "../lib/adminUserSearch.ts";

const SEARCH_DEBOUNCE_MS = 350;

export type AdminUserIdentity = Pick<
    AdminUserSummary,
    "userId" | "email" | "firstName" | "lastName"
>;

export function adminUserDisplayName(user: AdminUserIdentity): string {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

/** Selects an existing user account by search; free text is never sent as a user ID. */
export function AdminUserPicker({
    id,
    label,
    onSelect,
    disabled = false,
}: {
    readonly id: string;
    readonly label: string;
    readonly onSelect: (user?: AdminUserIdentity) => void;
    readonly disabled?: boolean;
}) {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<AdminUserIdentity>();
    const searchInput = useRef<HTMLInputElement>(null);
    const [focusSearch, setFocusSearch] = useState(false);
    const trimmedQuery = query.trim();
    const [debouncedQuery] = useDebounce(trimmedQuery, SEARCH_DEBOUNCE_MS);
    const usersQuery = useAdminUsers(
        { ...DEFAULT_ADMIN_USER_FILTERS, query: debouncedQuery },
        debouncedQuery.length > 0,
    );
    const users = usersQuery.data?.pages.flatMap((page) => page.items) ?? [];

    useEffect(() => {
        if (focusSearch && !selected) {
            searchInput.current?.focus();
            setFocusSearch(false);
        }
    }, [focusSearch, selected]);

    if (selected) {
        const name = adminUserDisplayName(selected);
        return (
            <div className="grid gap-2 border bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">{t("adminUsers.picker.selected")}</p>
                <p className="break-words font-medium">{name}</p>
                {name !== selected.email && (
                    <p className="break-all text-sm text-muted-foreground">{selected.email}</p>
                )}
                <p className="break-all font-mono text-xs text-muted-foreground">
                    {selected.userId}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start"
                    disabled={disabled}
                    onClick={() => {
                        setSelected(undefined);
                        setFocusSearch(true);
                        onSelect(undefined);
                    }}
                >
                    {t("adminUsers.picker.clear")}
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            <div className="grid gap-2">
                <Label htmlFor={id}>{label}</Label>
                <Input
                    ref={searchInput}
                    id={id}
                    type="search"
                    autoComplete="off"
                    spellCheck={false}
                    value={query}
                    disabled={disabled}
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>
            {!trimmedQuery ? (
                <p className="text-sm text-muted-foreground">
                    {t("adminUsers.picker.searchPrompt")}
                </p>
            ) : usersQuery.isPending || debouncedQuery !== trimmedQuery ? (
                // Results for an older search term must never be offered for the current one.
                <p role="status" className="text-sm text-muted-foreground">
                    {t("adminUsers.picker.loading")}
                </p>
            ) : usersQuery.error ? (
                <div role="alert" className="grid justify-items-start gap-2">
                    <p className="text-sm text-destructive">{usersQuery.error.message}</p>
                    <Button variant="outline" type="button" onClick={() => usersQuery.refetch()}>
                        {t("adminUsers.actions.retry")}
                    </Button>
                </div>
            ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("adminUsers.picker.noMatch")}</p>
            ) : (
                <>
                    <ul className="grid gap-2" aria-label={t("adminUsers.picker.results")}>
                        {users.map((user) => {
                            const name = adminUserDisplayName(user);
                            return (
                                <li key={user.userId}>
                                    <button
                                        type="button"
                                        className="grid w-full gap-1 border bg-surface-container-low p-3 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring"
                                        disabled={disabled}
                                        onClick={() => {
                                            const identity: AdminUserIdentity = {
                                                userId: user.userId,
                                                email: user.email,
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                            };
                                            setSelected(identity);
                                            onSelect(identity);
                                        }}
                                    >
                                        <span className="break-words font-medium">{name}</span>
                                        {name !== user.email && (
                                            <span className="break-all text-sm text-muted-foreground">
                                                {user.email}
                                            </span>
                                        )}
                                        <span className="break-all font-mono text-xs text-muted-foreground">
                                            {user.userId}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {usersQuery.hasNextPage && (
                        <Button
                            type="button"
                            variant="outline"
                            className="justify-self-center"
                            disabled={usersQuery.isFetchingNextPage}
                            onClick={() => usersQuery.fetchNextPage()}
                        >
                            {usersQuery.isFetchingNextPage
                                ? t("adminUsers.list.loadingMore")
                                : t("adminUsers.list.loadMore")}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
