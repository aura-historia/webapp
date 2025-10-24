import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { AccountSettings } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function AccountPage() {
    const { t } = useTranslation();
    const { user } = useAuthenticator();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate({ to: "/auth" }).catch((error) => {
                console.error("Navigation fehlgeschlagen:", error);
            });
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center max-w-3xl mx-auto px-4 py-8 w-full">
            <H1>{t("account.title")}</H1>

            {/* Change password */}
            <section className="bg-card text-card-foreground w-full max-w-lg mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-6">{t("account.changePassword.title")}</H2>
                <AccountSettings.ChangePassword
                    onSuccess={() => toast.success(t("account.changePassword.successMessage"))}
                    onError={() => toast.error(t("account.changePassword.errorMessage"))}
                    displayText={{
                        currentPasswordFieldLabel: t("account.changePassword.currentPasswordLabel"),
                        newPasswordFieldLabel: t("account.changePassword.newPasswordLabel"),
                        confirmPasswordFieldLabel: t("account.changePassword.confirmPasswordLabel"),
                        updatePasswordButtonText: t("account.changePassword.saveButton"),
                    }}
                />
            </section>

            {/* Delete account */}
            <section className="bg-card text-card-foreground w-full max-w-lg mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-6">{t("account.deleteAccount.title")}</H2>
                <AccountSettings.DeleteUser
                    displayText={{
                        deleteAccountButtonText: t("account.deleteAccount.deleteButton"),
                        warningText: t("account.deleteAccount.warningText"),
                        cancelButtonText: t("account.deleteAccount.cancelButton"),
                        confirmDeleteButtonText: t("account.deleteAccount.confirmButton"),
                    }}
                    onSuccess={() => toast.success(t("account.deleteAccount.successMessage"))}
                    onError={() => toast.error(t("account.deleteAccount.errorMessage"))}
                />
            </section>
        </div>
    );
}
