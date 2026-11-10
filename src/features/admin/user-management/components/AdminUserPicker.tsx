import { Loader2, Search } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import type { AdminUserSummary } from "@/data/internal/admin/AdminUser.ts";
import {
    ADMIN_ROW_ACTION_CLASS,
    FIELD_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
import { useAdminUsers } from "../api/useAdminUsers.ts";
import { DEFAULT_ADMIN_USER_FILTERS } from "../lib/adminUserSearch.ts";

const SEARCH_DEBOUNCE_MS = 350;

export type AdminUserIdentity = Pick<
    AdminUserSummary,
    "userId" | "email" | "firstName" | "lastName"
>;

/** The name, or the email when the account has none. */
export function adminUserDisplayName(user: {
    readonly email: string;
    readonly firstName?: string | null;
    readonly lastName?: string | null;
}): string {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

/**
 * Selects an existing user account by search (board "Admin · States", pickers); free text is never
 * sent as a user ID.
 */
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
            <div className="flex flex-col gap-2">
                <span className={FIELD_LABEL_CLASS}>{label}</span>
                <section
                    aria-label={t("adminUsers.picker.selected")}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface px-3.5 py-3 shadow-[inset_0_0_0_1.5px_var(--ink)]"
                >
                    <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium break-words">{name}</span>
                        {name !== selected.email && (
                            <span className="text-xs break-all text-ink-secondary">
                                {selected.email}
                            </span>
                        )}
                        <code className="font-mono text-[11px] break-all text-ink-secondary">
                            {selected.userId}
                        </code>
                    </span>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            setSelected(undefined);
                            setFocusSearch(true);
                            onSelect(undefined);
                        }}
                        className={cn(
                            "inline-flex h-9 cursor-pointer items-center px-3 text-meta font-medium underline underline-offset-3 disabled:cursor-not-allowed disabled:opacity-45",
                            FOCUS_CLASS,
                        )}
                    >
                        {t("adminUsers.picker.change")}
                    </button>
                </section>
            </div>
        );
    }

    let results: ReactNode;
    if (!trimmedQuery) {
        results = <PickerState text={t("adminUsers.filters.query")} />;
    } else if (usersQuery.isPending || debouncedQuery !== trimmedQuery) {
        // Results for an older search term must never be offered for the current one.
        results = <PickerState text={t("adminUsers.picker.loading")} spinner />;
    } else if (usersQuery.error) {
        results = (
            <PickerState text={t("adminUsers.picker.failed")} alert>
                <button
                    type="button"
                    onClick={() => void usersQuery.refetch()}
                    className={ADMIN_ROW_ACTION_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </PickerState>
        );
    } else if (users.length === 0) {
        results = <PickerState text={t("adminUsers.picker.none")} />;
    } else {
        results = (
            <>
                <ul aria-label={t("adminUsers.picker.results")} className="border-t border-line">
                    {users.map((user) => {
                        const name = adminUserDisplayName(user);
                        return (
                            <li key={user.userId}>
                                <button
                                    type="button"
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
                                    className={cn(
                                        "flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-3 border-b border-line-subtle px-2 py-2.5 text-left hover:enabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-45",
                                        FOCUS_CLASS,
                                    )}
                                >
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-sm font-medium break-words">
                                            {name}
                                        </span>
                                        <span className="text-xs break-all text-ink-secondary">
                                            {[name !== user.email && user.email, user.userId]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase"
                                    >
                                        {t("adminUsers.picker.select")}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {usersQuery.hasNextPage && (
                    <button
                        type="button"
                        disabled={usersQuery.isFetchingNextPage}
                        onClick={() => void usersQuery.fetchNextPage()}
                        className={cn(SMALL_SECONDARY_PILL_CLASS, "self-center")}
                    >
                        {usersQuery.isFetchingNextPage
                            ? t("adminCommon.loading")
                            : t("adminUsers.list.loadMoreUsers")}
                    </button>
                )}
            </>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <label htmlFor={id} className={FIELD_LABEL_CLASS}>
                {label}
            </label>
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-[13px] left-3.5 size-[17px] text-ink-muted"
                    strokeWidth={1.8}
                />
                <input
                    ref={searchInput}
                    id={id}
                    type="search"
                    autoComplete="off"
                    spellCheck={false}
                    value={query}
                    disabled={disabled}
                    onChange={(event) => setQuery(event.target.value)}
                    className={cn(FIELD_CLASS, "pl-[42px]")}
                />
            </div>
            {results}
        </div>
    );
}

function PickerState({
    text,
    spinner = false,
    alert = false,
    children,
}: {
    readonly text: string;
    readonly spinner?: boolean;
    readonly alert?: boolean;
    readonly children?: ReactNode;
}) {
    return (
        <div
            role={alert ? "alert" : "status"}
            className={cn(
                "flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-md bg-surface px-3.5 py-2.5 text-sm shadow-ring",
                alert ? "text-oxblood" : "text-ink-secondary",
            )}
        >
            <span className="inline-flex items-center gap-2">
                {spinner && (
                    <Loader2
                        aria-hidden="true"
                        className="size-[15px] animate-spin motion-reduce:animate-none"
                    />
                )}
                {text}
            </span>
            {children}
        </div>
    );
}
