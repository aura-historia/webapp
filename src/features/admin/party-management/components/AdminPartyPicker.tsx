import { Link } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PartyIdentity } from "@/data/internal/party/Party.ts";
import {
    ADMIN_ROW_ACTION_CLASS,
    FIELD_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
import { useAdminParties } from "../api/useAdminParties.ts";

type SelectedParty = PartyIdentity & { readonly name: string };

/**
 * Selects an existing canonical Party identity (board "Admin · States", pickers); free text never
 * creates a record.
 */
export function AdminPartyPicker({
    onSelect,
}: {
    readonly onSelect: (identity?: PartyIdentity) => void;
}) {
    const { t } = useTranslation();
    const inputId = useId();
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<SelectedParty>();
    const [focusSearch, setFocusSearch] = useState(false);
    const searchInput = useRef<HTMLInputElement>(null);
    const hasQuery = query.trim().length > 0;
    const partiesQuery = useAdminParties(hasQuery ? { query } : {}, hasQuery);
    const parties = partiesQuery.data?.pages.flatMap((page) => page.items) ?? [];

    useEffect(() => {
        if (focusSearch && !selected) {
            searchInput.current?.focus();
            setFocusSearch(false);
        }
    }, [focusSearch, selected]);

    if (selected) {
        return (
            <div className="flex flex-col gap-2">
                <span className={FIELD_LABEL_CLASS}>{t("adminParties.picker.label")}</span>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface px-3.5 py-3 shadow-[inset_0_0_0_1.5px_var(--ink)]">
                    <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium break-words">{selected.name}</span>
                        <code className="font-mono text-[11px] break-all text-ink-secondary">
                            {selected.partyId} · {selected.partySlugId}
                        </code>
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setSelected(undefined);
                            setFocusSearch(true);
                            onSelect(undefined);
                        }}
                        className={cn(
                            "inline-flex h-9 cursor-pointer items-center px-3 text-meta font-medium underline underline-offset-3",
                            FOCUS_CLASS,
                        )}
                    >
                        {t("adminParties.picker.change")}
                    </button>
                </div>
            </div>
        );
    }

    let results: ReactNode;
    if (!hasQuery) {
        results = <PickerState text={t("adminParties.filters.query")} />;
    } else if (partiesQuery.isPending) {
        results = <PickerState text={t("adminParties.picker.loading")} spinner />;
    } else if (partiesQuery.error) {
        results = (
            <PickerState text={t("adminParties.picker.failed")} alert>
                <button
                    type="button"
                    onClick={() => partiesQuery.refetch()}
                    className={ADMIN_ROW_ACTION_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </PickerState>
        );
    } else if (parties.length === 0) {
        results = (
            <PickerState text={t("adminParties.picker.noMatches")}>
                <Link
                    to="/$lng/admin/parties"
                    from="/$lng"
                    params={true}
                    className={ADMIN_ROW_ACTION_CLASS}
                >
                    {t("adminParties.picker.openOrganizations")}
                </Link>
            </PickerState>
        );
    } else {
        results = (
            <>
                <ul className="border-t border-line">
                    {parties.map((party) => {
                        const contact = [party.contact.phone, party.contact.email]
                            .filter(Boolean)
                            .join(" · ");
                        return (
                            <li key={party.partyId}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const identity: SelectedParty = {
                                            partyId: party.partyId,
                                            partySlugId: party.partySlugId,
                                            name: party.name,
                                        };
                                        setSelected(identity);
                                        onSelect({
                                            partyId: identity.partyId,
                                            partySlugId: identity.partySlugId,
                                        });
                                    }}
                                    className={cn(
                                        "flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-3 border-b border-line-subtle px-2 py-2.5 text-left hover:bg-surface-sunken",
                                        FOCUS_CLASS,
                                    )}
                                >
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-sm font-medium break-words">
                                            {party.name}
                                        </span>
                                        <span className="text-xs break-all text-ink-secondary">
                                            {[party.partyId, party.partySlugId, contact]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase"
                                    >
                                        {t("adminParties.picker.select")}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {partiesQuery.hasNextPage && (
                    <button
                        type="button"
                        disabled={partiesQuery.isFetchingNextPage}
                        onClick={() => partiesQuery.fetchNextPage()}
                        className={cn(SMALL_SECONDARY_PILL_CLASS, "self-center")}
                    >
                        {partiesQuery.isFetchingNextPage
                            ? t("adminCommon.loading")
                            : t("adminParties.list.loadMore")}
                    </button>
                )}
            </>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <label htmlFor={inputId} className={FIELD_LABEL_CLASS}>
                {t("adminParties.picker.label")}
            </label>
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-[13px] left-3.5 size-[17px] text-ink-muted"
                    strokeWidth={1.8}
                />
                <input
                    ref={searchInput}
                    id={inputId}
                    type="search"
                    autoComplete="off"
                    value={query}
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
                "flex min-h-12 items-center justify-between gap-3 rounded-md bg-surface px-3.5 py-2.5 text-sm shadow-ring",
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
