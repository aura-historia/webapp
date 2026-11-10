import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import {
    ADMIN_PAGE_SECTION_TITLE_CLASS,
    ADMIN_SKELETON_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
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
            <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-panel p-5 shadow-ring"
            >
                <p className="text-sm text-oxblood">{query.error.message}</p>
                <button
                    type="button"
                    onClick={() => query.refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("partyLocations.actions.retry")}
                </button>
            </div>
        );
    } else if (query.isPending) {
        content = (
            <div aria-busy="true" className="grid gap-4 md:grid-cols-2">
                <output className="sr-only">{t("partyLocations.list.loading")}</output>
                {[0, 1].map((index) => (
                    <span key={index} className={cn(ADMIN_SKELETON_CLASS, "h-72 rounded-panel")} />
                ))}
            </div>
        );
    } else if (locations.length === 0) {
        content = (
            <p className="rounded-panel px-5 py-8 text-center text-sm text-ink-secondary shadow-ring">
                {t("partyLocations.list.empty")}
            </p>
        );
    } else {
        content = (
            <>
                <ul className="grid gap-4 md:grid-cols-2" aria-label={t("partyLocations.title")}>
                    {locations.map((location) => (
                        <li key={location.id} className="min-w-0">
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
                    <p role="alert" className="text-meta text-oxblood">
                        {query.error.message}
                    </p>
                )}
                {query.hasNextPage && (
                    <button
                        type="button"
                        disabled={query.isFetchingNextPage}
                        onClick={() => query.fetchNextPage()}
                        className={cn(SECONDARY_PILL_CLASS, "self-center")}
                    >
                        {query.isFetchingNextPage
                            ? t("partyLocations.list.loadingMore")
                            : t("partyLocations.list.loadMore")}
                    </button>
                )}
            </>
        );
    }

    return (
        <section className="flex flex-col gap-4" aria-labelledby="party-locations-title">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="party-locations-title" className={ADMIN_PAGE_SECTION_TITLE_CLASS}>
                    {t("partyLocations.title")}
                </h2>
                <button
                    type="button"
                    disabled={accessLost}
                    onClick={() => openEditor({ kind: "create" })}
                    className={cn(SECONDARY_PILL_CLASS, "pr-[18px] pl-3.5")}
                >
                    <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    {t("partyLocations.actions.create")}
                </button>
            </div>
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
