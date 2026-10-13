import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import type { PartyLocation } from "@/data/internal/geography/PartyLocation.ts";
import { type PartyLocationScope, usePartyLocation } from "../api/usePartyLocations.ts";
import { PartyLocationDetail } from "./PartyLocationDetail.tsx";
import {
    PartyLocationEditorDialog,
    type PartyLocationEditorIntent,
} from "./PartyLocationEditorDialog.tsx";
import { PartyLocationList } from "./PartyLocationList.tsx";

/**
 * List, detail and editor for one Party's business sites. Callers own the entry point and
 * authorization context; every read and write is authorized by the backend.
 */
export function PartyLocationWorkspace({ scope }: { readonly scope: PartyLocationScope }) {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState<string>();
    const [editor, setEditor] = useState<{
        readonly intent: PartyLocationEditorIntent;
        readonly key: number;
    }>();
    const [editorOpen, setEditorOpen] = useState(false);
    const editedId =
        editor && editor.intent.kind !== "create" ? editor.intent.location.id : undefined;
    const edited = usePartyLocation(scope, editorOpen ? editedId : undefined);

    const openEditor = (intent: PartyLocationEditorIntent) => {
        setEditor((previous) => ({ intent, key: (previous?.key ?? 0) + 1 }));
        setEditorOpen(true);
    };
    const correct = (location: PartyLocation) => openEditor({ kind: "correct", location });
    const relocate = (location: PartyLocation) => openEditor({ kind: "relocate", location });

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
                <Button type="button" onClick={() => openEditor({ kind: "create" })}>
                    {t("partyLocations.actions.create")}
                </Button>
            </header>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <PartyLocationList scope={scope} selectedId={selectedId} onSelect={setSelectedId} />
                <div className="border bg-card p-4 sm:p-6">
                    {selectedId ? (
                        <PartyLocationDetail
                            key={selectedId}
                            scope={scope}
                            locationId={selectedId}
                            onCorrect={correct}
                            onRelocate={relocate}
                        />
                    ) : (
                        <p className="text-muted-foreground">{t("partyLocations.detail.empty")}</p>
                    )}
                </div>
            </div>
            {editor && (
                <PartyLocationEditorDialog
                    key={editor.key}
                    scope={scope}
                    intent={editor.intent}
                    current={edited.data}
                    open={editorOpen}
                    onOpenChange={setEditorOpen}
                    onSaved={(location) => setSelectedId(location.id)}
                />
            )}
        </section>
    );
}
