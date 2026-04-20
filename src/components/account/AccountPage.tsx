import { H1 } from "@/components/typography/H1";
import { H2 } from "@/components/typography/H2";
import { useTranslation } from "react-i18next";
import { PersonalDataForm } from "@/components/account/PersonalDataForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";

export function AccountPage() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center max-w-3xl mx-auto px-4 py-8 w-full">
            <H1 className="w-full max-w-lg mx-auto">{t("account.title")}</H1>

            {/* Personal Data */}
            <section className="bg-card text-card-foreground w-full max-w-lg mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-6">{t("account.personalData.title")}</H2>
                <PersonalDataForm />
            </section>

            {/* Change password */}
            <section className="bg-card text-card-foreground w-full max-w-lg mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-6">{t("account.changePassword.title")}</H2>
                <ChangePasswordForm />
            </section>

            {/* Delete account */}
            <section className="bg-card text-card-foreground w-full max-w-lg mx-auto p-6 mt-6 rounded-xl border shadow-sm">
                <H2 className="mb-6">{t("account.deleteAccount.title")}</H2>
                <DeleteAccountForm />
            </section>
        </div>
    );
}
