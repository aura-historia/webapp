import { Plus } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type {
    AdminOAuthClient,
    AdminOAuthClientFilters,
} from "@/data/internal/admin/AdminOAuthClient.ts";
import {
    type AdminChip,
    AdminActiveChips,
    AdminCell,
    AdminFilterPanel,
    AdminLedger,
    AdminLedgerRow,
    AdminLedgerSkeleton,
    AdminLoadMore,
    AdminPrimaryCell,
    AdminResultLine,
    AdminRowChevron,
    AdminTextField,
    AdminToolbar,
} from "@/features/admin/common/components/AdminDirectory.tsx";
import { AdminPageHeader } from "@/features/admin/common/components/AdminPageHeader.tsx";
import { AdminStatePanel } from "@/features/admin/common/components/AdminStatePanel.tsx";
import { AdminMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_TAG_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useAdminOAuthClients } from "../api/useAdminOAuthClients.ts";
import { AdminOAuthClientDetailDialog } from "../components/AdminOAuthClientDetailDialog.tsx";
import { AdminOAuthClientFormDialog } from "../components/AdminOAuthClientFormDialog.tsx";
import { hasAdminOAuthClientFilters } from "../lib/adminOAuthClientSearch.ts";
import { formatAdminDay } from "../lib/formatAdminOAuthClientDate.ts";

const LEDGER_COLUMNS = "minmax(0,1.8fr) minmax(0,2fr) minmax(0,0.8fr) 16px";
const VISIBLE_SCOPES = 2;

/** The OAuth client directory (board "Admin · Directory", section oauth); filters live in the URL. */
export function AdminOAuthClientsPage({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminOAuthClientFilters;
    readonly onFiltersChange: (filters: AdminOAuthClientFilters) => void;
}) {
    const { t, i18n } = useTranslation();
    const [selectedClientId, setSelectedClientId] = useState<string>();
    const [formOpen, setFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<AdminOAuthClient>();
    const query = useAdminOAuthClients(filters);
    const clients = query.data?.pages.flatMap((page) => page.items) ?? [];
    const total = query.data?.pages[0]?.total;
    const numbers = new Intl.NumberFormat(i18n.language);

    const openCreate = () => {
        setEditingClient(undefined);
        setFormOpen(true);
    };
    const createAction = (
        <button type="button" onClick={openCreate} className={PRIMARY_PILL_CLASS}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {t("adminOAuthClients.actions.create")}
        </button>
    );

    let content: ReactNode;
    if (query.error && clients.length === 0) {
        content = (
            <AdminStatePanel tone="error" title={t("adminOAuthClients.states.error")}>
                <button
                    type="button"
                    onClick={() => void query.refetch()}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </AdminStatePanel>
        );
    } else if (query.isPending) {
        content = <AdminLedgerSkeleton label={t("adminOAuthClients.loading")} />;
    } else if (clients.length === 0) {
        content = hasAdminOAuthClientFilters(filters) ? (
            <AdminStatePanel tone="empty" title={t("adminOAuthClients.states.noMatches")}>
                <button
                    type="button"
                    onClick={() => onFiltersChange({})}
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.filters.clearSearch")}
                </button>
            </AdminStatePanel>
        ) : (
            <AdminStatePanel tone="empty" title={t("adminOAuthClients.states.empty")}>
                {createAction}
            </AdminStatePanel>
        );
    } else {
        content = (
            <>
                <AdminResultLine
                    summary={
                        typeof total === "number"
                            ? t("adminCommon.result.loadedOfTotal", {
                                  loaded: numbers.format(clients.length),
                                  total: numbers.format(total),
                              })
                            : t("adminCommon.result.loaded", {
                                  loaded: numbers.format(clients.length),
                              })
                    }
                />
                <AdminLedger
                    label={t("adminOAuthClients.heading")}
                    columns={LEDGER_COLUMNS}
                    headings={[
                        t("adminOAuthClients.list.heads.client"),
                        t("adminOAuthClients.fields.scopes"),
                        t("adminOAuthClients.list.heads.issued"),
                    ]}
                >
                    {clients.map((client) => (
                        <OAuthClientRow
                            key={client.clientId}
                            client={client}
                            selected={client.clientId === selectedClientId}
                            onOpen={() => setSelectedClientId(client.clientId)}
                        />
                    ))}
                </AdminLedger>
                <AdminLoadMore
                    hasNextPage={Boolean(query.hasNextPage)}
                    isFetchingNextPage={query.isFetchingNextPage}
                    isError={query.isFetchNextPageError}
                    onLoadMore={() => void query.fetchNextPage()}
                    label={t("adminOAuthClients.list.loadMoreClients")}
                />
            </>
        );
    }

    return (
        <>
            <AdminPageHeader title={t("adminOAuthClients.heading")} action={createAction} />
            <OAuthClientToolbar filters={filters} onFiltersChange={onFiltersChange} />
            {content}
            <AdminOAuthClientDetailDialog
                clientId={selectedClientId}
                open={Boolean(selectedClientId)}
                onOpenChange={(open) => {
                    if (!open) setSelectedClientId(undefined);
                }}
                onEdit={(client) => {
                    setSelectedClientId(undefined);
                    setEditingClient(client);
                    setFormOpen(true);
                }}
                onDeleted={() => setSelectedClientId(undefined)}
            />
            <AdminOAuthClientFormDialog
                key={editingClient?.clientId ?? "create"}
                mode={editingClient ? "edit" : "create"}
                client={editingClient}
                open={formOpen}
                onOpenChange={setFormOpen}
            />
        </>
    );
}

function OAuthClientToolbar({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminOAuthClientFilters;
    readonly onFiltersChange: (filters: AdminOAuthClientFilters) => void;
}) {
    const { t } = useTranslation();
    const [name, setName] = useState(filters.name ?? "");
    useEffect(() => {
        setName(filters.name ?? "");
    }, [filters.name]);

    const nameLabel = t("adminOAuthClients.filters.name");
    const clientIdLabel = t("adminOAuthClients.fields.clientId");
    const chips: AdminChip[] = [
        ...(filters.name
            ? [
                  {
                      key: "name",
                      label: `${nameLabel}: ${filters.name}`,
                      onRemove: () => onFiltersChange({ ...filters, name: undefined }),
                  },
              ]
            : []),
        ...(filters.clientId
            ? [
                  {
                      key: "clientId",
                      label: `${clientIdLabel}: ${filters.clientId}`,
                      onRemove: () => onFiltersChange({ ...filters, clientId: undefined }),
                  },
              ]
            : []),
    ];

    return (
        <AdminToolbar
            label={t("adminOAuthClients.filters.title")}
            search={{
                label: nameLabel,
                value: name,
                onChange: setName,
                onSubmit: () => onFiltersChange({ ...filters, name: name.trim() || undefined }),
            }}
            panelCount={filters.clientId ? 1 : 0}
            panel={(close) => (
                <ClientIdPanel
                    label={clientIdLabel}
                    initial={filters.clientId ?? ""}
                    onApply={(clientId) => {
                        onFiltersChange({ ...filters, clientId });
                        close();
                    }}
                />
            )}
            chips={<AdminActiveChips chips={chips} onClearAll={() => onFiltersChange({})} />}
        />
    );
}

function ClientIdPanel({
    label,
    initial,
    onApply,
}: {
    readonly label: string;
    readonly initial: string;
    readonly onApply: (clientId: string | undefined) => void;
}) {
    const [clientId, setClientId] = useState(initial);
    return (
        <AdminFilterPanel
            onApply={() => onApply(clientId.trim() || undefined)}
            onReset={() => onApply(undefined)}
        >
            <AdminTextField label={label} value={clientId} onChange={setClientId} mono />
        </AdminFilterPanel>
    );
}

function OAuthClientRow({
    client,
    selected,
    onOpen,
}: {
    readonly client: AdminOAuthClient;
    readonly selected: boolean;
    readonly onOpen: () => void;
}) {
    const { t, i18n } = useTranslation();
    const issued = new Date(client.clientIdIssuedAt * 1000);
    const hidden = client.scopes.length - VISIBLE_SCOPES;
    return (
        <AdminLedgerRow selected={selected} onClick={onOpen}>
            <AdminPrimaryCell title={client.clientName} sub={client.clientId} subMono />
            <AdminCell head={t("adminOAuthClients.fields.scopes")}>
                {client.scopes.length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                        {client.scopes.slice(0, VISIBLE_SCOPES).map((scope) => (
                            <span key={scope} className={ADMIN_TAG_CLASS}>
                                {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
                            </span>
                        ))}
                        {hidden > 0 && <span className={ADMIN_TAG_CLASS}>+{hidden}</span>}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-meta text-ink-muted">
                        <AdminMark tone="brass" className="size-2" />
                        {t("adminOAuthClients.list.noScopes")}
                    </span>
                )}
            </AdminCell>
            <AdminCell head={t("adminOAuthClients.list.heads.issued")}>
                <time dateTime={issued.toISOString()} className="tabular-nums">
                    {formatAdminDay(issued, i18n.language)}
                </time>
            </AdminCell>
            <AdminRowChevron />
        </AdminLedgerRow>
    );
}
