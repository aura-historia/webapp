import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { PartyLocation } from "@/data/internal/geography/PartyLocation.ts";
import {
    PartyLocationRequestError,
    type PartyLocationScope,
    usePartyLocationList,
} from "../api/usePartyLocations.ts";
import { PartyLocationCard } from "./PartyLocationCard.tsx";
import {
    PartyLocationEditorDialog,
    type PartyLocationEditorIntent,
} from "./PartyLocationEditorDialog.tsx";

/**
 * Every business location of one Party, active and retired, with all details and actions in
 * place; creating, correcting and relocating open the editor. Callers own the entry point and
 * authorization context; every read and write is authorized by the backend.
 */
export function PartyLocationWorkspace({ scope }: { readonly scope: PartyLocationScope }) {
    const { t } = useTranslation();
    const query = usePartyLocationList(scope);
    const [editor, setEditor] = useState<{
        readonly intent: PartyLocationEditorIntent;
        readonly key: number;
    }>();
    const [editorOpen, setEditorOpen] = useState(false);
    const accessLost = query.error instanceof PartyLocationRequestError && query.error.isAccessLoss;
    // Lost access hides previously loaded protected content instead of showing it beside the error.
    const locations = accessLost ? [] : (query.data?.pages.flatMap((page) => page.items) ?? []);
    const editedId =
        editor && editor.intent.kind !== "create" ? editor.intent.location.id : undefined;
    const current = locations.find((location) => location.id === editedId);

    const openEditor = (intent: PartyLocationEditorIntent) => {
        setEditor((previous) => ({ intent, key: (previous?.key ?? 0) + 1 }));
        setEditorOpen(true);
    };
    const correct = (location: PartyLocation) => openEditor({ kind: "correct", location });
    const relocate = (location: PartyLocation) => openEditor({ kind: "relocate", location });

    let content: ReactNode;
    if (query.error && locations.length === 0) {
        content = (
            <div role="alert" className="grid justify-items-start gap-3 py-4">
                <p className="text-muted-foreground">{query.error.message}</p>
                <Button type="button" variant="outline" onClick={() => query.refetch()}>
                    {t("partyLocations.actions.retry")}
                </Button>
            </div>
        );
    } else if (query.isPending) {
        content = (
            <div className="grid gap-3" aria-busy="true">
                <output className="sr-only">{t("partyLocations.list.loading")}</output>
                {[0, 1].map((index) => (
                    <Skeleton key={index} className="h-48 w-full" />
                ))}
            </div>
        );
    } else if (locations.length === 0) {
        content = <p className="py-4 text-muted-foreground">{t("partyLocations.list.empty")}</p>;
    } else {
        content = (
            <div className="grid gap-3">
                <ul className="grid gap-3" aria-label={t("partyLocations.title")}>
                    {locations.map((location) => (
                        <li key={location.id}>
                            <PartyLocationCard
                                scope={scope}
                                location={location}
                                onCorrect={correct}
                                onRelocate={relocate}
                            />
                        </li>
                    ))}
                </ul>
                {query.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {query.error.message}
                    </p>
                )}
                {query.hasNextPage && (
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-center"
                        disabled={query.isFetchingNextPage}
                        onClick={() => query.fetchNextPage()}
                    >
                        {query.isFetchingNextPage
                            ? t("partyLocations.list.loadingMore")
                            : t("partyLocations.list.loadMore")}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <section className="grid gap-4" aria-labelledby="party-locations-title">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid gap-1">
                    <h2 id="party-locations-title" className="text-xl font-medium">
                        {t("partyLocations.title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t("partyLocations.description")}
                    </p>
                </div>
                <Button
                    type="button"
                    disabled={accessLost}
                    onClick={() => openEditor({ kind: "create" })}
                >
                    {t("partyLocations.actions.create")}
                </Button>
            </header>
            {content}
            {editor && (
                <PartyLocationEditorDialog
                    key={editor.key}
                    scope={scope}
                    intent={editor.intent}
                    current={current}
                    open={editorOpen}
                    onOpenChange={setEditorOpen}
                />
            )}
        </section>
    );
}
