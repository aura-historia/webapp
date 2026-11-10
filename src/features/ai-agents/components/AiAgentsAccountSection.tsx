import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import {
    AI_AGENTS_SECTION_IDS,
    SIGN_IN_SCOPES,
} from "@/features/ai-agents/config/aiAgentsPage.data.ts";
import {
    AI_AGENTS_INTRO_CLASS,
    AI_AGENTS_SPLIT_CLASS,
    AI_AGENTS_TEXT_LINK_CLASS,
} from "@/features/ai-agents/lib/aiAgentsStyles.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

/** The heading id of the connected apps list on the access tokens page. */
const CONNECTED_APPS_FRAGMENT = "partner-connected-apps";

const ITEM_CLASS = "flex flex-col gap-3 border-t border-ink pt-6 pb-8";
const NUMERAL_CLASS = "font-serif text-[34px] leading-none text-oxblood";
const ITEM_TITLE_CLASS = "font-serif text-[26px] leading-[1.15] font-normal";

/** III — Your account: what sign-in asks for, how long it lasts and how to disconnect. */
export function AiAgentsAccountSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={AI_AGENTS_SECTION_IDS.account}
            labelledBy="ai-agents-account-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <div className={cn(AI_AGENTS_SPLIT_CLASS, "items-end")}>
                <SectionHeading
                    id="ai-agents-account-heading"
                    eyebrow={`III — ${t("aiAgentsPage.account.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="aiAgentsPage.account.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className={AI_AGENTS_INTRO_CLASS}>{t("aiAgentsPage.account.description")}</p>
            </div>

            <ol className="grid grid-cols-1 min-[1080px]:grid-cols-3 min-[1080px]:gap-x-7">
                <li className={ITEM_CLASS}>
                    <span aria-hidden="true" className={NUMERAL_CLASS}>
                        I
                    </span>
                    <h3 className={ITEM_TITLE_CLASS}>{t("aiAgentsPage.account.signIn.title")}</h3>
                    <p className="text-body text-ink-secondary">
                        {t("aiAgentsPage.account.signIn.body")}
                    </p>
                    <ul
                        aria-label={t("aiAgentsPage.account.signIn.scopesLabel")}
                        className="flex flex-wrap gap-1.5 pt-1"
                    >
                        {SIGN_IN_SCOPES.map((scope) => (
                            <li
                                key={scope}
                                className="rounded-sm bg-surface-sunken px-2 py-[3px] text-meta leading-normal text-ink-secondary"
                            >
                                {t(`aiAgentsPage.account.signIn.scopes.${scope}`)}
                            </li>
                        ))}
                    </ul>
                </li>
                <li className={ITEM_CLASS}>
                    <span aria-hidden="true" className={NUMERAL_CLASS}>
                        II
                    </span>
                    <h3 className={ITEM_TITLE_CLASS}>{t("aiAgentsPage.account.duration.title")}</h3>
                    <p className="text-body text-ink-secondary">
                        {t("aiAgentsPage.account.duration.body")}
                    </p>
                    <dl className="flex gap-7 pt-1">
                        {(["unused", "max"] as const).map((limit) => (
                            <div key={limit} className="flex flex-col gap-1">
                                <dt className="font-mono text-tag tracking-[0.14em] text-ink-muted uppercase">
                                    {t(`aiAgentsPage.account.duration.${limit}Label`)}
                                </dt>
                                <dd className="font-serif text-[30px] leading-[1.1]">
                                    {t(`aiAgentsPage.account.duration.${limit}Value`)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </li>
                <li className={ITEM_CLASS}>
                    <span aria-hidden="true" className={NUMERAL_CLASS}>
                        III
                    </span>
                    <h3 className={ITEM_TITLE_CLASS}>
                        {t("aiAgentsPage.account.disconnect.title")}
                    </h3>
                    <p className="text-body text-ink-secondary">
                        {t("aiAgentsPage.account.disconnect.body")}
                    </p>
                    <Link
                        to="/$lng/partners/access-tokens"
                        params={true}
                        from="/$lng"
                        hash={CONNECTED_APPS_FRAGMENT}
                        className={AI_AGENTS_TEXT_LINK_CLASS}
                    >
                        {t("aiAgentsPage.account.disconnect.cta")}
                        <ArrowRight aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    </Link>
                </li>
            </ol>

            <p className="max-w-[880px] text-body-sm text-ink-secondary">
                <Trans
                    i18nKey="aiAgentsPage.account.privacy"
                    components={{
                        privacyLink: (
                            <Link
                                to="/$lng/privacy"
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "text-ink underline underline-offset-3",
                                    NAV_FOCUS_CLASS,
                                )}
                            />
                        ),
                    }}
                />
            </p>
        </LandingSection>
    );
}
