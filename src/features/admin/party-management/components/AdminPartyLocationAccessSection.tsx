import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { PartyLocationManager } from "@/data/internal/geography/PartyLocationManager.ts";
import type { Party } from "@/data/internal/party/Party.ts";
import {
    type AdminUserIdentity,
    AdminUserPicker,
    adminUserDisplayName,
} from "@/features/admin/user-management/components/AdminUserPicker.tsx";
import {
    usePartyLocationManager,
    usePartyLocationManagers,
    useSetPartyLocationManagementGrant,
} from "../api/usePartyLocationManagers.ts";

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
        <section className="grid gap-4" aria-labelledby="admin-party-location-access-title">
            <div className="grid gap-1">
                <h2 id="admin-party-location-access-title" className="text-xl font-medium">
                    {t("adminParties.locationAccess.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t("adminParties.locationAccess.description", { name: party.name })}
                </p>
            </div>
            {setGrant.error && !confirming && (
                <p role="alert" className="text-sm text-destructive">
                    {setGrant.error.message}
                </p>
            )}
            {result && (
                <p role="status" className="text-sm">
                    {t(
                        result.granted
                            ? "adminParties.locationAccess.granted"
                            : "adminParties.locationAccess.revoked",
                        { user: adminUserDisplayName(result.user), name: party.name },
                    )}
                </p>
            )}

            <PartyLocationManagerList
                partyId={party.partyId}
                disabled={setGrant.isPending}
                onRevoke={(manager) =>
                    request({ user: manager, granted: false, fromPicker: false })
                }
            />

            <div className="grid gap-4 border bg-card p-4 sm:p-5">
                <h3 className="font-medium">{t("adminParties.locationAccess.changeTitle")}</h3>
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

            <AlertDialog
                open={confirming}
                onOpenChange={(open) => {
                    if (!open && !setGrant.isPending) setConfirming(false);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t(
                                grantRequested
                                    ? "adminParties.locationAccess.confirmGrantTitle"
                                    : "adminParties.locationAccess.confirmRevokeTitle",
                            )}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                grantRequested
                                    ? "adminParties.locationAccess.confirmGrant"
                                    : "adminParties.locationAccess.confirmRevoke",
                                { user: actionUserName, name: party.name },
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {action && (
                        <p className="break-all font-mono text-xs text-muted-foreground">
                            {action.user.userId}
                        </p>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={setGrant.isPending}>
                            {t("adminParties.actions.cancel")}
                        </AlertDialogCancel>
                        {/* A plain button keeps the dialog open until the request settles. */}
                        <Button
                            type="button"
                            variant={grantRequested ? "default" : "destructive"}
                            disabled={setGrant.isPending}
                            onClick={submit}
                        >
                            {setGrant.isPending
                                ? t("adminParties.actions.saving")
                                : t(
                                      grantRequested
                                          ? "adminParties.locationAccess.confirmGrantButton"
                                          : "adminParties.locationAccess.confirmRevokeButton",
                                  )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
        content = <Skeleton className="h-24 w-full" />;
    } else if (managersQuery.error) {
        content = (
            <div role="alert" className="grid justify-items-start gap-2">
                <p className="text-sm text-destructive">{managersQuery.error.message}</p>
                <Button variant="outline" type="button" onClick={() => managersQuery.refetch()}>
                    {t("adminParties.actions.retry")}
                </Button>
            </div>
        );
    } else if (managers.length === 0) {
        content = (
            <p className="text-sm text-muted-foreground">
                {t("adminParties.locationAccess.empty")}
            </p>
        );
    } else {
        content = (
            <>
                <ul className="grid gap-2">
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
                    <Button
                        type="button"
                        variant="outline"
                        className="justify-self-center"
                        disabled={managersQuery.isFetchingNextPage}
                        onClick={() => managersQuery.fetchNextPage()}
                    >
                        {managersQuery.isFetchingNextPage
                            ? t("adminParties.list.loadingMore")
                            : t("adminParties.list.loadMore")}
                    </Button>
                )}
            </>
        );
    }

    return (
        <div className="grid gap-3">
            <div className="grid gap-1">
                <h3 className="font-medium">{t("adminParties.locationAccess.managersTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                    {t("adminParties.locationAccess.managersDescription")}
                </p>
            </div>
            {content}
        </div>
    );
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
        <li className="flex flex-wrap items-start justify-between gap-3 border bg-surface-container-low p-3">
            <div className="grid min-w-0 gap-1">
                <p className="break-words font-medium">{name}</p>
                {name !== manager.email && (
                    <p className="break-all text-sm text-muted-foreground">{manager.email}</p>
                )}
                <p className="break-all font-mono text-xs text-muted-foreground">
                    {manager.userId}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                    {manager.hasExplicitGrant && (
                        <Badge variant="secondary">
                            {t("adminParties.locationAccess.access.explicit")}
                        </Badge>
                    )}
                    {manager.partnershipIds.length > 0 && (
                        <Badge variant="outline">
                            {t("adminParties.locationAccess.access.partnership")}
                        </Badge>
                    )}
                </div>
                {manager.partnershipIds.length > 0 && (
                    <p className="break-all text-xs text-muted-foreground">
                        {t("adminParties.locationAccess.access.partnerships")}{" "}
                        <span className="font-mono">{manager.partnershipIds.join(", ")}</span>
                    </p>
                )}
            </div>
            {manager.hasExplicitGrant && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    aria-label={t("adminParties.locationAccess.revokeFor", { user: name })}
                    onClick={onRevoke}
                >
                    {t("adminParties.locationAccess.confirmRevokeButton")}
                </Button>
            )}
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
    const userName = adminUserDisplayName(user);

    if (accessQuery.isPending) {
        return (
            <p role="status" className="text-sm text-muted-foreground">
                {t("adminParties.locationAccess.state.checking")}
            </p>
        );
    }
    if (accessQuery.error) {
        return (
            <div role="alert" className="grid justify-items-start gap-2">
                <p className="text-sm text-destructive">{accessQuery.error.message}</p>
                <Button variant="outline" type="button" onClick={() => accessQuery.refetch()}>
                    {t("adminParties.actions.retry")}
                </Button>
            </div>
        );
    }

    const manager = accessQuery.data;
    const hasExplicitGrant = manager?.hasExplicitGrant ?? false;
    const hasPartnership = (manager?.partnershipIds.length ?? 0) > 0;
    let stateKey = "none";
    if (hasExplicitGrant && hasPartnership) stateKey = "both";
    else if (hasExplicitGrant) stateKey = "explicit";
    else if (hasPartnership) stateKey = "partnership";

    return (
        <div className="grid justify-items-start gap-3">
            <p className="text-sm">
                {t(`adminParties.locationAccess.state.${stateKey}`, { user: userName })}
            </p>
            {hasExplicitGrant ? (
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || accessQuery.isFetching}
                    onClick={() => onRequest(false)}
                >
                    {t("adminParties.locationAccess.revoke")}
                </Button>
            ) : (
                <Button
                    type="button"
                    disabled={disabled || accessQuery.isFetching}
                    onClick={() => onRequest(true)}
                >
                    {t("adminParties.locationAccess.grant")}
                </Button>
            )}
        </div>
    );
}
