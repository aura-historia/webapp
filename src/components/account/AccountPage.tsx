import { H1 } from "@/components/typography/H1";
import { H2 } from "@/components/typography/H2";
import { useTranslation } from "react-i18next";
import { PersonalDataForm } from "@/components/account/PersonalDataForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";
import { SubscriptionPlanSection } from "@/components/account/SubscriptionPlanSection";

export function AccountPage() {
    const { t } = useTranslation();

    return (
        <div className="w-full px-4 py-8 md:px-8 md:py-12">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
                <H1 className="text-4xl md:text-5xl">{t("account.title")}</H1>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    <section className="flex flex-col gap-6">
                        <H2>{t("account.personalData.title")}</H2>
                        <div className="bg-background text-card-foreground rounded-sm border p-6 shadow-sm md:p-10">
                            <PersonalDataForm />
                        </div>
                    </section>

                    <section className="flex flex-col gap-6">
                        <H2>{t("account.changePassword.title")}</H2>
                        <div className="bg-background text-card-foreground rounded-sm border p-6 shadow-sm md:p-10">
                            <ChangePasswordForm />
                        </div>
                    </section>
                </div>

                <SubscriptionPlanSection />

                <section className="flex flex-col gap-6">
                    <H2 className="text-destructive">{t("account.deleteAccount.title")}</H2>
                    <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-6 md:p-10">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="max-w-3xl space-y-2">
                                <p className="text-base font-medium text-destructive md:text-lg">
                                    {t("account.deleteAccount.warningTitle")}
                                </p>
                                <p className="text-sm text-destructive/90 md:text-base">
                                    {t("account.deleteAccount.warningSubtitle")}
                                </p>
                            </div>
                            <div className="w-full md:w-auto md:min-w-44">
                                <DeleteAccountForm />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
