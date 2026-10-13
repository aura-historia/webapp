import { useState } from "react";
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
import { Button } from "@/components/ui/button.tsx";
import type { Party } from "@/data/internal/party/Party.ts";
import {
    type AdminUserIdentity,
    AdminUserPicker,
    adminUserDisplayName,
} from "@/features/admin/user-management/components/AdminUserPicker.tsx";
import { useSetPartyLocationManagementGrant } from "../api/usePartyLocationManagementGrant.ts";

type ConfirmedResult = {
    readonly user: AdminUserIdentity;
    readonly granted: boolean;
};

/**
 * Administrator-only control for one user's explicit authority over a Party's locations. The
 * contract exposes no grant-state read, so this never lists managers or shows a current state;
 * it reports only the outcome of a confirmed command.
 */
export function AdminPartyLocationAccessSection({ party }: { readonly party: Party }) {
    const { t } = useTranslation();
    const setGrant = useSetPartyLocationManagementGrant();
    const [user, setUser] = useState<AdminUserIdentity>();
    const [pickerKey, setPickerKey] = useState(0);
    // The requested action outlives the dialog so its copy stays stable while it closes.
    const [grantRequested, setGrantRequested] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [result, setResult] = useState<ConfirmedResult>();

    const select = (next?: AdminUserIdentity) => {
        setGrant.reset();
        setResult(undefined);
        setUser(next);
    };

    const confirm = (granted: boolean) => {
        setGrant.reset();
        setResult(undefined);
        setGrantRequested(granted);
        setConfirming(true);
    };

    const submit = () => {
        if (!user) return;
        const granted = grantRequested;
        setGrant.mutate(
            { partyId: party.partyId, userId: user.userId, granted },
            {
                onSuccess: () => {
                    setResult({ user, granted });
                    setUser(undefined);
                    // Remount the picker so the next action starts from an empty search.
                    setPickerKey((key) => key + 1);
                },
                onSettled: () => setConfirming(false),
            },
        );
    };

    const userName = user ? adminUserDisplayName(user) : "";

    return (
        <section className="grid gap-4" aria-labelledby="admin-party-location-access-title">
            <div className="grid gap-1">
                <h2 id="admin-party-location-access-title" className="text-xl font-medium">
                    {t("adminParties.locationAccess.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t("adminParties.locationAccess.description", { name: party.name })}
                </p>
                <p className="text-sm text-muted-foreground">
                    {t("adminParties.locationAccess.noList")}
                </p>
            </div>
            <div className="grid gap-4 border bg-card p-4 sm:p-5">
                <AdminUserPicker
                    key={pickerKey}
                    id="admin-party-location-access-user"
                    label={t("adminParties.locationAccess.userLabel")}
                    disabled={setGrant.isPending}
                    onSelect={select}
                />
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        disabled={!user || setGrant.isPending}
                        onClick={() => confirm(true)}
                    >
                        {t("adminParties.locationAccess.grant")}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={!user || setGrant.isPending}
                        onClick={() => confirm(false)}
                    >
                        {t("adminParties.locationAccess.revoke")}
                    </Button>
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
                                { user: userName, name: party.name },
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {user && (
                        <p className="break-all font-mono text-xs text-muted-foreground">
                            {user.userId}
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
