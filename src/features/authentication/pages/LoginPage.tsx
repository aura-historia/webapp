import { Trans, useTranslation } from "react-i18next";
import { AuthFlow, type AuthStep } from "@/features/authentication/components/AuthFlow.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";

type LoginPageProps = {
    readonly step: AuthStep;
    readonly onStepChange: (step: AuthStep) => void;
    readonly onComplete: () => void;
    readonly locale: string;
    readonly redirect?: string;
};

/**
 * The login route (design board "Auth · Sign in & registration"). From 1024px the account
 * promise and the current auth step share the parchment ground in two equal halves, divided
 * by a centred hairline; on smaller screens a short ink band sits above the sign-in and
 * registration forms only.
 */
export function LoginPage({ step, onStepChange, onComplete, locale, redirect }: LoginPageProps) {
    const { t } = useTranslation();
    const showBand = step === "sign-in" || step === "sign-up";

    return (
        <div className="w-full">
            {showBand && (
                <div
                    data-theme="dark"
                    className="flex flex-col gap-2.5 bg-surface px-(--page-gutter) py-6 text-ink lg:hidden"
                >
                    <p className="font-mono text-kicker tracking-[0.2em] text-brass-ink uppercase">
                        {t("auth.page.eyebrow")}
                    </p>
                    <p className="font-serif text-[26px] leading-[1.15] tracking-[-0.01em] [&_em]:text-brass-light [&_em]:italic">
                        <Trans i18nKey="auth.page.heading" components={HEADLINE_COMPONENTS} />
                    </p>
                </div>
            )}

            <div className="mx-auto grid w-full max-w-content grid-cols-1 px-(--page-gutter) lg:grid-cols-2">
                <aside className="hidden py-24 pr-[clamp(28px,4vw,64px)] shadow-[inset_-1px_0_0_var(--line-subtle)] lg:block">
                    <div className="sticky top-40 flex max-w-[440px] flex-col gap-6">
                        <p className="font-mono text-eyebrow text-brass-ink uppercase">
                            {t("auth.page.eyebrow")}
                        </p>
                        <p className="font-serif text-[clamp(40px,3.9vw,56px)] leading-[1.04] tracking-[-0.02em] text-ink [&_em]:italic">
                            <Trans i18nKey="auth.page.heading" components={HEADLINE_COMPONENTS} />
                        </p>
                        <p className="text-[17px] leading-[1.6] text-ink-secondary">
                            {t("auth.page.lead")}
                        </p>
                    </div>
                </aside>

                <div className="flex justify-center pt-8 pb-24 lg:justify-start lg:pt-24 lg:pb-30 lg:pl-[clamp(28px,4vw,64px)]">
                    <div className="w-full max-w-[440px]">
                        <AuthFlow
                            step={step}
                            onStepChange={onStepChange}
                            onComplete={onComplete}
                            locale={locale}
                            redirect={redirect}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
