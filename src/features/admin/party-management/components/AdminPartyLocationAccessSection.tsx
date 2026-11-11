import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PartyLocationManager } from "@/data/internal/geography/PartyLocationManager.ts";
import type { Party } from "@/data/internal/party/Party.ts";
import {
    ADMIN_DANGER_OUTLINE_CLASS,
    ADMIN_PAGE_SECTION_TITLE_CLASS,
    ADMIN_PANEL_CLASS,
    ADMIN_ROW_ACTION_CLASS,
    ADMIN_SKELETON_CLASS,
    ADMIN_STRONG_TAG_CLASS,
    ADMIN_TAG_CLASS,
    PRIMARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { AdminErrorLine } from "@/features/admin/partnership-management/components/AdminConflictNotice.tsx";
import {
    type AdminUserIdentity,
    AdminUserPicker,
    adminUserDisplayName,
} from "@/features/admin/user-management/components/AdminUserPicker.tsx";
import { cn } from "@/lib/utils.ts";
import {
    usePartyLocationManager,
    usePartyLocationManagers,
    useSetPartyLocationManagementGrant,
} from "../api/usePartyLocationManagers.ts";
import { AdminConfirmDialog } from "./AdminConfirmDialog.tsx";

type GrantAction = {
    readonly user: AdminUserIdentity;
    readonly granted: boolean;
    /** Whether the action was started from the picker, which is cleared after success. */
    readonly fromPicker: boolean;
};

/**
 * Administrator-only control for users' explicit authority over a Party's locations. Lists
 * current managers with their independent reasons (explicit grant, active partnership
 * membership); only the explicit grant can be changed here.
 */
export function AdminPartyLocationAccessSection({ party }: { readonly party: Party }) {
    const { t } = useTranslation();
    const setGrant = useSetPartyLocationManagementGrant();
    const [user, setUser] = useState<AdminUserIdentity>();
    const [pickerKey, setPickerKey] = useState(0);
    // The requested action outlives the dialog so its copy stays stable while it closes.
    const [action, setAction] = useState<GrantAction>();
    const [confirming, setConfirming] = useState(false);
    const [result, setResult] = useState<Omit<GrantAction, "fromPicker">>();

    const select = (next?: AdminUserIdentity) => {
        setGrant.reset();
        setResult(undefined);
        setUser(next);
    };

    const request = (next: GrantAction) => {
        setGrant.reset();
        setResult(undefined);
        setAction(next);
        setConfirming(true);
    };

    const submit = () => {
        if (!action) return;
        setGrant.mutate(
            { partyId: party.partyId, userId: action.user.userId, granted: action.granted },
            {
                onSuccess: () => {
                    setResult({ user: action.user, granted: action.granted });
                    if (action.fromPicker) {
                        setUser(undefined);
                        // Remount the picker so the next action starts from an empty search.
                        setPickerKey((key) => key + 1);
                    }
                },
                onSettled: () => setConfirming(false),
            },
        );
    };

    const grantRequested = action?.granted ?? true;
    const actionUserName = action ? adminUserDisplayName(action.user) : "";

    return (
        <section
            className="flex flex-col gap-4"
            aria-labelledby="admin-party-location-access-title"
        >
            <h2 id="admin-party-location-access-title" className={ADMIN_PAGE_SECTION_TITLE_CLASS}>
                {t("adminParties.locationAccess.heading")}
            </h2>
            {setGrant.error && !confirming && <AdminErrorLine message={setGrant.error.message} />}
            {result && (
                <output className="block text-sm text-ink-secondary">
                    {t(
                        result.granted
                            ? "adminParties.locationAccess.granted"
                            : "adminParties.locationAccess.revoked",
                        { user: adminUserDisplayName(result.user), name: party.name },
                    )}
                </output>
            )}

            <PartyLocationManagerList
                partyId={party.partyId}
                disabled={setGrant.isPending}
                onRevoke={(manager) =>
                    request({ user: manager, granted: false, fromPicker: false })
                }
            />

            <div className={cn(ADMIN_PANEL_CLASS, "flex flex-col gap-4 p-5 sm:p-[22px]")}>
                <h3 className="text-[15px] font-semibold">
                    {t("adminParties.locationAccess.cardTitle")}
                </h3>
                <AdminUserPicker
                    key={pickerKey}
                    id="admin-party-location-access-user"
                    label={t("adminParties.locationAccess.userLabel")}
                    disabled={setGrant.isPending}
                    onSelect={select}
                />
                {user && (
                    <SelectedUserAccess
                        partyId={party.partyId}
                        user={user}
                        disabled={setGrant.isPending}
                        onRequest={(granted) => request({ user, granted, fromPicker: true })}
                    />
                )}
            </div>

            <AdminConfirmDialog
                open={confirming}
                onOpenChange={setConfirming}
                tone={grantRequested ? "primary" : "danger"}
                title={t(
                    grantRequested
                        ? "adminParties.locationAccess.confirmGrantTitle"
                        : "adminParties.locationAccess.confirmRevokeTitle",
                )}
                description={t(
                    grantRequested
                        ? "adminParties.locationAccess.confirmGrant"
                        : "adminParties.locationAccess.confirmRevoke",
                    { user: actionUserName, name: party.name },
                )}
                confirmLabel={t(
                    grantRequested
                        ? "adminParties.locationAccess.confirmGrantButton"
                        : "adminParties.locationAccess.confirmRevokeButton",
                )}
                pending={setGrant.isPending}
                onConfirm={submit}
            >
                {action && (
                    <p className="font-mono text-xs break-all text-ink-muted">
                        {action.user.userId}
                    </p>
                )}
            </AdminConfirmDialog>
        </section>
    );
}

function PartyLocationManagerList({
    partyId,
    disabled,
    onRevoke,
}: {
    readonly partyId: string;
    readonly disabled: boolean;
    readonly onRevoke: (manager: PartyLocationManager) => void;
}) {
    const { t } = useTranslation();
    const managersQuery = usePartyLocationManagers(partyId);
    const managers = managersQuery.data?.pages.flatMap((page) => page.items) ?? [];

    let content: ReactNode;
    if (managersQuery.isPending) {
        content = (
            <div aria-busy="true" className="flex flex-col gap-2 border-t border-line pt-3.5">
                <span className={cn(ADMIN_SKELETON_CLASS, "h-4 w-1/3")} />
                <span className={cn(ADMIN_SKELETON_CLASS, "h-3 w-1/2")} />
            </div>
        );
    } else if (managersQuery.error) {
        content = (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
                <AdminErrorLine message={managersQuery.error.message} className="text-sm" />
                <button
                    type="button"
                    onClick={() => managersQuery.refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </div>
        );
    } else if (managers.length === 0) {
        content = (
            <p className="border-t border-line pt-3.5 text-sm text-ink-muted">
                {t("adminParties.locationAccess.empty")}
            </p>
        );
    } else {
        content = (
            <>
                <ul
                    aria-label={t("adminParties.locationAccess.heading")}
                    className="border-t border-line"
                >
                    {managers.map((manager) => (
                        <PartyLocationManagerItem
                            key={manager.userId}
                            manager={manager}
                            disabled={disabled}
                            onRevoke={() => onRevoke(manager)}
                        />
                    ))}
                </ul>
                {managersQuery.hasNextPage && (
                    <button
                        type="button"
                        disabled={managersQuery.isFetchingNextPage}
                        onClick={() => managersQuery.fetchNextPage()}
                        className={cn(SMALL_SECONDARY_PILL_CLASS, "self-center")}
                    >
                        {managersQuery.isFetchingNextPage
                            ? t("adminCommon.loading")
                            : t("adminParties.list.loadMore")}
                    </button>
                )}
            </>
        );
    }

    return <div className="flex flex-col gap-3">{content}</div>;
}

function PartyLocationManagerItem({
    manager,
    disabled,
    onRevoke,
}: {
    readonly manager: PartyLocationManager;
    readonly disabled: boolean;
    readonly onRevoke: () => void;
}) {
    const { t } = useTranslation();
    const name = adminUserDisplayName(manager);

    return (
        <li className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-line-subtle py-3.5">
            <div className="flex min-w-0 flex-col gap-1">
                <p className="text-[15px] font-medium break-words">{name}</p>
                {name !== manager.email && (
                    <p className="text-meta break-all text-ink-secondary">{manager.email}</p>
                )}
                <code className="font-mono text-[11px] break-all text-ink-muted">
                    {manager.userId}
                </code>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {manager.hasExplicitGrant && (
                    <span className={ADMIN_STRONG_TAG_CLASS}>
                        {t("adminParties.locationAccess.access.explicit")}
                    </span>
                )}
                {manager.partnershipIds.length > 0 && (
                    <span className={ADMIN_TAG_CLASS}>
                        {t("adminParties.locationAccess.access.member")}
                    </span>
                )}
                {manager.hasExplicitGrant && (
                    <button
                        type="button"
                        disabled={disabled}
                        aria-label={t("adminParties.locationAccess.revokeFor", { user: name })}
                        onClick={onRevoke}
                        className={ADMIN_ROW_ACTION_CLASS}
                    >
                        {t("adminParties.locationAccess.confirmRevokeButton")}
                    </button>
                )}
            </div>
        </li>
    );
}

/** Shows the selected user's current access and offers only the explicit-grant change. */
function SelectedUserAccess({
    partyId,
    user,
    disabled,
    onRequest,
}: {
    readonly partyId: string;
    readonly user: AdminUserIdentity;
    readonly disabled: boolean;
    readonly onRequest: (granted: boolean) => void;
}) {
    const { t } = useTranslation();
    const accessQuery = usePartyLocationManager(partyId, user.userId);

    if (accessQuery.isPending) {
        return (
            <output className="block text-sm text-ink-secondary">
                {t("adminParties.locationAccess.state.checking")}
            </output>
        );
    }
    if (accessQuery.error) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3">
                <AdminErrorLine message={accessQuery.error.message} className="text-sm" />
                <button
                    type="button"
                    onClick={() => accessQuery.refetch()}
                    className={SMALL_SECONDARY_PILL_CLASS}
                >
                    {t("adminCommon.retry")}
                </button>
            </div>
        );
    }

    const manager = accessQuery.data;
    const hasExplicitGrant = manager?.hasExplicitGrant ?? false;
    const hasPartnership = (manager?.partnershipIds.length ?? 0) > 0;
    let statusKey = "none";
    if (hasExplicitGrant && hasPartnership) statusKey = "both";
    else if (hasExplicitGrant) statusKey = "explicit";
    else if (hasPartnership) statusKey = "partnership";

    return (
        <>
            <output className="block text-sm leading-normal text-ink-secondary">
                {t(`adminParties.locationAccess.status.${statusKey}`)}
            </output>
            {hasExplicitGrant ? (
                <button
                    type="button"
                    disabled={disabled || accessQuery.isFetching}
                    onClick={() => onRequest(false)}
                    className={cn(ADMIN_DANGER_OUTLINE_CLASS, "self-start")}
                >
                    {t("adminParties.locationAccess.confirmRevokeButton")}
                </button>
            ) : (
                <button
                    type="button"
                    disabled={disabled || accessQuery.isFetching}
                    onClick={() => onRequest(true)}
                    className={cn(PRIMARY_PILL_CLASS, "self-start")}
                >
                    {t("adminParties.locationAccess.confirmGrantButton")}
                </button>
            )}
        </>
    );
}
