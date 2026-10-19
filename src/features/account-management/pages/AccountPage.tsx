import { Trans, useTranslation } from "react-i18next";
import { AccountSection } from "@/features/account-management/components/AccountSection.tsx";
import { ChangePasswordForm } from "@/features/account-management/components/ChangePasswordForm.tsx";
import { DeleteAccountForm } from "@/features/account-management/components/DeleteAccountForm.tsx";
import { PersonalDataForm } from "@/features/account-management/components/PersonalDataForm.tsx";
import { SubscriptionPlanSection } from "@/features/account-management/components/SubscriptionPlanSection.tsx";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { FOCUS_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const SECTIONS = [
    { id: "personal-data", titleKey: "account.personalData.title" },
    { id: "change-password", titleKey: "account.changePassword.title" },
    { id: "subscription", titleKey: "account.subscription.title" },
    { id: "delete-account", titleKey: "account.deleteAccount.title" },
] as const;

export function AccountPage() {
    const { t } = useTranslation();
    const { data: userAccount } = useUserAccount();

    return (
        <div className="mx-auto w-full max-w-[calc(1088px+2*var(--page-gutter))] px-(--page-gutter) pt-8 pb-24 sm:pt-14 sm:pb-36">
            <header className="flex flex-col gap-3 pb-6 sm:gap-4 sm:pb-9">
                <p className="font-mono text-[11px] tracking-[0.2em] text-brass-ink uppercase sm:text-eyebrow">
                    {t("account.eyebrow")}
                </p>
                <h1 className="font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] sm:text-[clamp(40px,4.6vw,68px)] sm:leading-[1.02] [&_em]:italic">
                    <Trans i18nKey="account.heading" components={HEADLINE_COMPONENTS} />
                </h1>
                {userAccount?.email && (
                    <p className="text-body-sm text-ink-muted wrap-anywhere">
                        <Trans
                            i18nKey="account.signedInAs"
                            values={{ email: userAccount.email }}
                            components={{ email: <span className="text-ink" /> }}
                        />
                    </p>
                )}
            </header>

            <nav
                aria-label={t("account.sectionsNav")}
                className="-mx-(--page-gutter) mb-2 flex gap-2 overflow-x-auto px-(--page-gutter) pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-x-7 sm:gap-y-2 sm:overflow-visible sm:px-0 sm:pb-0 sm:shadow-[inset_0_-1px_0_var(--line-subtle)] [&::-webkit-scrollbar]:hidden"
            >
                {SECTIONS.map((section, index) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={cn(
                            "inline-flex h-9 shrink-0 items-center gap-2 rounded-pill px-3.5 text-meta whitespace-nowrap text-ink shadow-[inset_0_0_0_1px_var(--line)] sm:h-auto sm:min-h-11 sm:rounded-xs sm:px-0 sm:text-body-sm sm:text-ink-muted sm:shadow-none sm:hover:text-ink",
                            FOCUS_CLASS,
                        )}
                    >
                        <span className="font-mono text-tag text-ink-muted">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        {t(section.titleKey)}
                    </a>
                ))}
            </nav>

            <AccountSection
                id="personal-data"
                title={t("account.personalData.title")}
                description={t("account.personalData.description")}
            >
                <PersonalDataForm />
            </AccountSection>

            <AccountSection
                id="change-password"
                title={t("account.changePassword.title")}
                description={t("account.changePassword.description")}
            >
                <ChangePasswordForm />
            </AccountSection>

            <AccountSection
                id="subscription"
                title={t("account.subscription.title")}
                description={t("account.subscription.description")}
            >
                <SubscriptionPlanSection />
            </AccountSection>

            <AccountSection id="delete-account" title={t("account.deleteAccount.title")}>
                <DeleteAccountForm />
            </AccountSection>
        </div>
    );
}
