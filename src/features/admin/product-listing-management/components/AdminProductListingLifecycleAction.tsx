import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {
    ADMIN_DANGER_OUTLINE_CLASS,
    ADMIN_DIALOG_CONTENT_CLASS,
    ADMIN_SECTION_TITLE_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import type { AdminProductListingDetail } from "@/data/internal/product/AdminProductListing.ts";
import { cn } from "@/lib/utils.ts";
import {
    useRestoreAdminProductListing,
    useWithdrawAdminProductListing,
} from "../api/useAdminProductListings.ts";

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

/**
 * The header's Withdraw (oxblood outline) or Restore (ink) action and its confirmation, which
 * shows the version captured when it opened. Unrecognized lifecycles offer no action.
 */
export function AdminProductListingLifecycleAction({
    listing,
}: {
    readonly listing: AdminProductListingDetail;
}) {
    const { t } = useTranslation();
    const withdraw = useWithdrawAdminProductListing(listing.productListingId);
    const restore = useRestoreAdminProductListing(listing.productListingId);
    const [confirmation, setConfirmation] = useState<PendingConfirmation>();
    const actionButton = useRef<HTMLButtonElement>(null);
    const action = availableAction(listing);
    const pending = withdraw.isPending || restore.isPending;

    if (!action) return null;

    const open = () => {
        withdraw.reset();
        restore.reset();
        setConfirmation({ action, expectedVersion: listing.expectedVersion });
    };

    const confirm = async () => {
        if (!confirmation) return;
        const { expectedVersion } = confirmation;
        try {
            if (confirmation.action === "withdraw") {
                await withdraw.mutateAsync({ expectedVersion });
                toast.success(t("adminProductListings.lifecycle.withdrawnToast"));
            } else {
                const result = await restore.mutateAsync({ expectedVersion });
                toast.success(
                    t(
                        result.outcome === "CHANGED"
                            ? "adminProductListings.lifecycle.restoredToast"
                            : "adminProductListings.lifecycle.restoreUnchangedToast",
                    ),
                );
            }
        } catch (error) {
            // The listing is refetched; it must be reviewed before another attempt.
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("adminProductListings.errors.requestFailed"),
            );
        }
        setConfirmation(undefined);
    };

    return (
        <>
            <button
                ref={actionButton}
                type="button"
                disabled={pending}
                onClick={open}
                className={action === "withdraw" ? ADMIN_DANGER_OUTLINE_CLASS : PRIMARY_PILL_CLASS}
            >
                {t(`adminProductListings.lifecycle.${action}Action`)}
            </button>
            <AlertDialog
                open={confirmation !== undefined}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen && !pending) setConfirmation(undefined);
                }}
            >
                <AlertDialogContent
                    className={cn(ADMIN_DIALOG_CONTENT_CLASS, "gap-5 p-6 sm:max-w-[480px] sm:p-7")}
                    onCloseAutoFocus={(event) => {
                        if (!actionButton.current) return;
                        event.preventDefault();
                        actionButton.current.focus();
                    }}
                >
                    {confirmation && (
                        <>
                            <AlertDialogHeader className="gap-3 text-left">
                                <AlertDialogTitle className={ADMIN_SECTION_TITLE_CLASS}>
                                    {t(
                                        `adminProductListings.lifecycle.${confirmation.action}Title`,
                                    )}
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="flex flex-col gap-2 text-sm leading-normal text-ink-secondary">
                                        <p>
                                            {t(
                                                `adminProductListings.lifecycle.${confirmation.action}Consequence`,
                                            )}
                                        </p>
                                        <p>{t("adminProductListings.lifecycle.convergence")}</p>
                                        <p className="font-mono text-xs text-ink-muted">
                                            {t("adminProductListings.lifecycle.version", {
                                                version: confirmation.expectedVersion,
                                            })}
                                        </p>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2.5">
                                <AlertDialogCancel
                                    disabled={pending}
                                    className={SECONDARY_PILL_CLASS}
                                >
                                    {t("adminCommon.cancel")}
                                </AlertDialogCancel>
                                {/* A plain button keeps the dialog open until the request settles. */}
                                <button
                                    type="button"
                                    disabled={pending}
                                    aria-busy={pending}
                                    onClick={() => void confirm()}
                                    className={cn(
                                        PRIMARY_PILL_CLASS,
                                        confirmation.action === "withdraw" &&
                                            "bg-oxblood text-on-oxblood",
                                    )}
                                >
                                    {pending && (
                                        <Loader2
                                            aria-hidden="true"
                                            className="size-[15px] animate-spin motion-reduce:animate-none"
                                        />
                                    )}
                                    {t(
                                        `adminProductListings.lifecycle.${confirmation.action}Confirm`,
                                    )}
                                </button>
                            </AlertDialogFooter>
                        </>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
