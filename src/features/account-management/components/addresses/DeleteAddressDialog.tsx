import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import {
    UserAddressRequestError,
    useDeleteUserAddress,
} from "@/features/account-management/hooks/useUserAddresses.ts";
import {
    ADDRESS_DIALOG_BUTTON_CLASS,
    addressAlertClass,
} from "@/features/account-management/lib/addressStyles.ts";
import { cn } from "@/lib/utils.ts";

interface DeleteAddressDialogProps {
    readonly viewerCacheKey: string;
    /** The current loaded version; after a conflict the refreshed list passes the new one. */
    readonly address: UserAddress;
    readonly onClose: () => void;
}

/** Confirms deleting one saved address; locks while the request runs. */
export function DeleteAddressDialog({
    viewerCacheKey,
    address,
    onClose,
}: DeleteAddressDialogProps) {
    const { t } = useTranslation();
    const { mutate, isPending } = useDeleteUserAddress(viewerCacheKey);
    const [conflicted, setConflicted] = useState(false);

    const confirm = () => {
        mutate(address, {
            onSuccess: () => {
                toast.success(t("account.addresses.toasts.deleted"));
                onClose();
            },
            onError: (error) => {
                if (!(error instanceof UserAddressRequestError)) return;
                if (error.isConflict) {
                    setConflicted(true);
                } else if (error.isNotFound) {
                    toast.info(t("account.addresses.toasts.missing"));
                    onClose();
                } else if (error.isAccessLoss) {
                    onClose();
                } else {
                    toast.error(t("account.addresses.toasts.deleteFailed"));
                }
            },
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
            <DialogContent
                role="alertdialog"
                showCloseButton={false}
                onInteractOutside={(event) => isPending && event.preventDefault()}
                onEscapeKeyDown={(event) => isPending && event.preventDefault()}
                className="gap-5 p-7 sm:max-w-[440px]"
            >
                <DialogHeader className="gap-2 text-left">
                    <DialogTitle className="leading-[1.15] wrap-anywhere">
                        {t("account.addresses.delete.title", { label: address.label })}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="flex flex-col gap-2 leading-[1.6]">
                            <p>{t("account.addresses.delete.body")}</p>
                            {address.preferred && (
                                <p className="text-ink">
                                    {t("account.addresses.delete.preferred")}
                                </p>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>
                {conflicted && (
                    <div role="alert" className={addressAlertClass("danger")}>
                        <CircleAlert
                            aria-hidden="true"
                            className="mt-0.5 size-[17px] shrink-0 text-oxblood"
                            strokeWidth={1.8}
                        />
                        <span className="leading-[1.55]">
                            {t("account.addresses.delete.conflict")}
                        </span>
                    </div>
                )}
                <DialogFooter className="gap-2.5">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={onClose}
                        className={cn(
                            ADDRESS_DIALOG_BUTTON_CLASS,
                            "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                        )}
                    >
                        {t("account.addresses.delete.cancel")}
                    </button>
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={confirm}
                        className={cn(
                            ADDRESS_DIALOG_BUTTON_CLASS,
                            "bg-oxblood px-[22px] text-on-oxblood",
                        )}
                    >
                        {isPending && <Spinner className="size-[15px]" />}
                        {t("account.addresses.delete.confirm")}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
