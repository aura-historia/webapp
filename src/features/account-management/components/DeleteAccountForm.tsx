import { useNavigate } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
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
import { useDeleteUserAccount } from "@/features/account-management/hooks/useDeleteUserAccount.ts";
import { CARD_CLASS, FOCUS_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { cn } from "@/lib/utils.ts";

const DIALOG_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
    FOCUS_CLASS,
);

export function DeleteAccountForm() {
    const { t } = useTranslation();
    const navigate = useNavigate({ from: "/$lng" });
    const { signOut } = useResolvedAuth();
    const { mutate: deleteUserAccount, isPending } = useDeleteUserAccount();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteUserAccount(undefined, {
            onSuccess: async () => {
                toast.success(t("account.deleteAccount.successMessage"));
                setOpen(false);
                await signOut();
                await navigate({ to: "/$lng" });
            },
            onError: (error) => {
                toast.error(error.message || t("account.deleteAccount.errorMessage"));
            },
        });
    };

    return (
        <div className={cn(CARD_CLASS, "flex flex-col gap-6 sm:flex-row sm:items-center")}>
            <div className="flex min-w-0 flex-1 items-start gap-4">
                <span
                    aria-hidden="true"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                >
                    <TriangleAlert className="size-[18px]" strokeWidth={1.8} />
                </span>
                <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="font-serif text-[20px] leading-[1.3]">
                        {t("account.deleteAccount.warningTitle")}
                    </p>
                    <p className="text-body-sm text-ink-secondary">
                        {t("account.deleteAccount.warningSubtitle")}
                    </p>
                </div>
            </div>
            <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => setOpen(true)}
                className={cn(
                    "inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center rounded-pill px-[22px] text-button text-oxblood shadow-[inset_0_0_0_1.5px_var(--oxblood)] sm:w-auto",
                    FOCUS_CLASS,
                )}
            >
                {t("account.deleteAccount.deleteButton")}
            </button>

            <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
                <DialogContent
                    role="alertdialog"
                    showCloseButton={!isPending}
                    closeLabel={t("account.deleteAccount.closeButton")}
                    className="gap-5 rounded-panel border-0 bg-surface-raised p-7 text-ink shadow-menu sm:max-w-[440px] [&>[data-slot=dialog-close]]:top-6 [&>[data-slot=dialog-close]]:right-6 [&>[data-slot=dialog-close]]:inline-flex [&>[data-slot=dialog-close]]:size-9 [&>[data-slot=dialog-close]]:items-center [&>[data-slot=dialog-close]]:justify-center [&>[data-slot=dialog-close]]:rounded-pill [&>[data-slot=dialog-close]]:text-ink-muted"
                >
                    <DialogHeader className="gap-2 text-left">
                        <DialogTitle className="pr-8 font-serif text-title-md font-normal">
                            {t("account.deleteAccount.title")}
                        </DialogTitle>
                        <DialogDescription className="text-body-sm text-ink-secondary">
                            {t("account.deleteAccount.warningText")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row flex-wrap justify-end gap-2.5 sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className={cn(
                                DIALOG_BUTTON_CLASS,
                                "px-5 text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                            )}
                        >
                            {t("account.deleteAccount.cancelButton")}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className={cn(
                                DIALOG_BUTTON_CLASS,
                                "bg-oxblood px-[22px] text-on-oxblood",
                            )}
                        >
                            {isPending && <Spinner aria-hidden="true" />}
                            {t("account.deleteAccount.confirmButton")}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
