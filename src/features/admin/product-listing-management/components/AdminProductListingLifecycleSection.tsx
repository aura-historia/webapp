import { useRef, useState } from "react";
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
import type { AdminProductListingDetail } from "@/data/internal/product/AdminProductListing.ts";
import {
    useRestoreAdminProductListing,
    useWithdrawAdminProductListing,
} from "../api/useAdminProductListings.ts";
import { AdminProductListingLifecycleBadge } from "./AdminProductListingPresentation.tsx";

type LifecycleAction = "withdraw" | "restore";

type PendingConfirmation = {
    readonly action: LifecycleAction;
    /** Captured when the confirmation opened; a newer version requires a new confirmation. */
    readonly expectedVersion: number;
};

function availableAction(listing: AdminProductListingDetail): LifecycleAction | undefined {
    if (listing.lifecycle === "ACTIVE") return "withdraw";
    if (listing.lifecycle === "WITHDRAWN") return "restore";
    return undefined;
}

export function AdminProductListingLifecycleSection({
    listing,
}: {
    readonly listing: AdminProductListingDetail;
}) {
    const { t } = useTranslation();
    const withdraw = useWithdrawAdminProductListing(listing.productListingId);
    const restore = useRestoreAdminProductListing(listing.productListingId);
    const [confirmation, setConfirmation] = useState<PendingConfirmation>();
    const [notice, setNotice] = useState<string>();
    const actionButton = useRef<HTMLButtonElement>(null);
    const action = availableAction(listing);
    const pending = withdraw.isPending || restore.isPending;
    const error = withdraw.error ?? restore.error;

    const open = (next: LifecycleAction) => {
        withdraw.reset();
        restore.reset();
        setNotice(undefined);
        setConfirmation({ action: next, expectedVersion: listing.expectedVersion });
    };

    const confirm = async () => {
        if (!confirmation) return;
        const { expectedVersion } = confirmation;
        try {
            if (confirmation.action === "withdraw") {
                await withdraw.mutateAsync({ expectedVersion });
                setNotice(t("adminProductListings.lifecycle.withdrawn"));
            } else {
                const result = await restore.mutateAsync({ expectedVersion });
                setNotice(
                    t(
                        result.outcome === "CHANGED"
                            ? "adminProductListings.lifecycle.restored"
                            : "adminProductListings.lifecycle.restoreUnchanged",
                    ),
                );
            }
        } catch {
            // The error is shown below; the refetched listing must be reviewed before retrying.
        }
        setConfirmation(undefined);
    };

    return (
        <section
            className="grid gap-4 border bg-surface-container-low p-5"
            aria-labelledby="admin-product-listing-lifecycle-title"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <h2
                        id="admin-product-listing-lifecycle-title"
                        className="font-display text-2xl italic"
                    >
                        {t("adminProductListings.lifecycle.title")}
                    </h2>
                    <AdminProductListingLifecycleBadge lifecycle={listing.lifecycle} />
                </div>
                {action && (
                    <Button
                        ref={actionButton}
                        type="button"
                        variant={action === "withdraw" ? "destructive" : "default"}
                        disabled={pending}
                        onClick={() => open(action)}
                    >
                        {t(`adminProductListings.lifecycle.${action}Action`)}
                    </Button>
                )}
            </div>
            <p className="text-sm text-muted-foreground">
                {t(
                    action
                        ? `adminProductListings.lifecycle.${action}Help`
                        : "adminProductListings.lifecycle.unknownHelp",
                )}
            </p>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error.message}
                </p>
            )}
            {notice && <output className="text-sm text-muted-foreground">{notice}</output>}
            <AlertDialog
                open={confirmation !== undefined}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen && !pending) setConfirmation(undefined);
                }}
            >
                <AlertDialogContent
                    onCloseAutoFocus={(event) => {
                        if (!actionButton.current) return;
                        event.preventDefault();
                        actionButton.current.focus();
                    }}
                >
                    {confirmation && (
                        <>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t(
                                        `adminProductListings.lifecycle.${confirmation.action}Title`,
                                    )}
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="grid gap-2">
                                        <p>
                                            {t(
                                                `adminProductListings.lifecycle.${confirmation.action}Consequence`,
                                            )}
                                        </p>
                                        <p>{t("adminProductListings.lifecycle.convergence")}</p>
                                        <p className="font-mono text-xs">
                                            {t("adminProductListings.lifecycle.version", {
                                                version: confirmation.expectedVersion,
                                            })}
                                        </p>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={pending}>
                                    {t("adminProductListings.actions.cancel")}
                                </AlertDialogCancel>
                                {/* A plain button keeps the dialog open until the request settles. */}
                                <Button
                                    type="button"
                                    variant={
                                        confirmation.action === "withdraw"
                                            ? "destructive"
                                            : "default"
                                    }
                                    disabled={pending}
                                    onClick={() => void confirm()}
                                >
                                    {pending
                                        ? t("adminProductListings.actions.working")
                                        : t(
                                              `adminProductListings.lifecycle.${confirmation.action}Confirm`,
                                          )}
                                </Button>
                            </AlertDialogFooter>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
