import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { PartyIdentity } from "@/data/internal/party/Party.ts";
import { useAdminParties } from "../api/useAdminParties.ts";

type SelectedParty = PartyIdentity & { readonly name: string };

/** Selects an existing canonical Party identity; free text never creates a record. */
export function AdminPartyPicker({
    onSelect,
}: {
    readonly onSelect: (identity?: PartyIdentity) => void;
}) {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<SelectedParty>();
    const hasQuery = query.trim().length > 0;
    const partiesQuery = useAdminParties(hasQuery ? { query } : {}, hasQuery);
    const parties = partiesQuery.data?.pages.flatMap((page) => page.items) ?? [];

    if (selected) {
        return (
            <div className="grid gap-2 border bg-surface-container-low p-3">
                <p className="text-xs text-muted-foreground">{t("adminParties.picker.selected")}</p>
                <p className="break-words font-medium">{selected.name}</p>
                <p className="break-all font-mono text-xs text-muted-foreground">
                    {selected.partyId} · {selected.partySlugId}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="justify-self-start"
                    onClick={() => {
                        setSelected(undefined);
                        onSelect(undefined);
                    }}
                >
                    {t("adminParties.picker.clear")}
                </Button>
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            <div className="grid gap-2">
                <Label htmlFor="admin-party-picker-query">{t("adminParties.picker.label")}</Label>
                <Input
                    id="admin-party-picker-query"
                    type="search"
                    autoComplete="off"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>
            {!hasQuery ? (
                <p className="text-sm text-muted-foreground">
                    {t("adminParties.picker.searchPrompt")}
                </p>
            ) : partiesQuery.isPending ? (
                <p role="status" className="text-sm text-muted-foreground">
                    {t("adminParties.picker.loading")}
                </p>
            ) : partiesQuery.error ? (
                <div role="alert" className="grid justify-items-start gap-2">
                    <p className="text-sm text-destructive">{partiesQuery.error.message}</p>
                    <Button variant="outline" type="button" onClick={() => partiesQuery.refetch()}>
                        {t("adminParties.actions.retry")}
                    </Button>
                </div>
            ) : parties.length === 0 ? (
                <div className="grid gap-2 text-sm text-muted-foreground">
                    <p>{t("adminParties.picker.noMatch")}</p>
                    <Link
                        to="/$lng/admin/parties"
                        from="/$lng"
                        params={true}
                        className="text-primary underline-offset-4 hover:underline"
                    >
                        {t("adminParties.picker.manageLink")}
                    </Link>
                </div>
            ) : (
                <>
                    <ul className="grid gap-2">
                        {parties.map((party) => (
                            <li key={party.partyId}>
                                <button
                                    type="button"
                                    className="grid w-full gap-1 border bg-surface-container-low p-3 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring"
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
                                >
                                    <span className="break-words font-medium">{party.name}</span>
                                    <span className="break-all font-mono text-xs text-muted-foreground">
                                        {party.partyId} · {party.partySlugId}
                                    </span>
                                    <span className="break-all text-xs text-muted-foreground">
                                        {[party.contact.phone, party.contact.email]
                                            .filter(Boolean)
                                            .join(" · ") || t("adminParties.fields.notProvided")}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {partiesQuery.hasNextPage && (
                        <Button
                            type="button"
                            variant="outline"
                            className="justify-self-center"
                            disabled={partiesQuery.isFetchingNextPage}
                            onClick={() => partiesQuery.fetchNextPage()}
                        >
                            {partiesQuery.isFetchingNextPage
                                ? t("adminParties.list.loadingMore")
                                : t("adminParties.list.loadMore")}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
