import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteUserAccount } from "@/hooks/account/useDeleteUserAccount";

export function DeleteAccountForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { signOut } = useAuthenticator((context) => [context.signOut]);
    const { mutate: deleteUserAccount, isPending } = useDeleteUserAccount();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteUserAccount(undefined, {
            onSuccess: async () => {
                toast.success(t("account.deleteAccount.successMessage"));
                setOpen(false);
                signOut();
                await navigate({ to: "/" });
            },
            onError: (error) => {
                toast.error(error.message || t("account.deleteAccount.errorMessage"));
            },
        });
    };

    return (
        <>
            <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={() => setOpen(true)}
            >
                {t("account.deleteAccount.deleteButton")}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent showCloseButton={!isPending}>
                    <DialogHeader>
                        <DialogTitle>{t("account.deleteAccount.title")}</DialogTitle>
                        <DialogDescription>
                            {t("account.deleteAccount.warningText")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            {t("account.deleteAccount.cancelButton")}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending && <Spinner />}
                            {t("account.deleteAccount.confirmButton")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
