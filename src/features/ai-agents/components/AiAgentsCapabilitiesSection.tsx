import { Trans, useTranslation } from "react-i18next";

import {
    AI_AGENTS_SECTION_IDS,
    CAPABILITY_GROUPS,
    EXAMPLE_REQUESTS,
} from "@/features/ai-agents/config/aiAgentsPage.data.ts";
import {
    AI_AGENTS_INTRO_CLASS,
    AI_AGENTS_LABEL_CLASS,
    AI_AGENTS_SPLIT_CLASS,
} from "@/features/ai-agents/lib/aiAgentsStyles.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

/** I — What it can do: the public tools, the ones that need sign-in, then example requests. */
export function AiAgentsCapabilitiesSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={AI_AGENTS_SECTION_IDS.capabilities}
            labelledBy="ai-agents-capabilities-heading"
            containerClassName="flex flex-col gap-12 sm:gap-14"
        >
            <div className={cn(AI_AGENTS_SPLIT_CLASS, "items-start gap-9")}>
                <div className="flex flex-col gap-4 sm:gap-5">
                    <SectionHeading
                        id="ai-agents-capabilities-heading"
                        eyebrow={`I — ${t("aiAgentsPage.capabilities.eyebrow")}`}
                        title={
                            <Trans
                                i18nKey="aiAgentsPage.capabilities.title"
                                components={HEADLINE_COMPONENTS}
                            />
                        }
                    />
                    <p className={AI_AGENTS_INTRO_CLASS}>
                        {t("aiAgentsPage.capabilities.description")}
                    </p>
                </div>
                <div className="grid gap-9 min-[760px]:grid-cols-2 min-[760px]:gap-12">
                    {CAPABILITY_GROUPS.map((group) => (
                        <div key={group.id} className="flex flex-col gap-3">
                            <h3 className={AI_AGENTS_LABEL_CLASS}>
                                {t(`aiAgentsPage.capabilities.groups.${group.id}.heading`)}
                            </h3>
                            <ul className="border-b border-line">
                                {group.items.map((item) => (
                                    <li
                                        key={item}
                                        className="grid grid-cols-[14px_minmax(0,1fr)] items-baseline gap-2.5 border-t border-line py-[13px] text-body leading-[1.55]"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "size-1.5 -translate-y-0.5 rounded-full",
                                                group.id === "public"
                                                    ? "bg-ink"
                                                    : "shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
                                            )}
                                        />
                                        <span>
                                            {t(
                                                `aiAgentsPage.capabilities.groups.${group.id}.items.${item}`,
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className={AI_AGENTS_LABEL_CLASS}>
                    {t("aiAgentsPage.capabilities.examples.label")}
                </h3>
                <ul className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-2 min-[1180px]:grid-cols-4">
                    {EXAMPLE_REQUESTS.map((request) => (
                        <li
                            key={request.id}
                            className="flex min-h-[168px] flex-col justify-between gap-5 rounded-card bg-surface-raised p-6 shadow-ring"
                        >
                            <p className="font-serif text-[21px] leading-[1.3]">
                                {t("aiAgentsPage.capabilities.examples.quoted", {
                                    text: t(
                                        `aiAgentsPage.capabilities.examples.items.${request.id}`,
                                    ),
                                })}
                            </p>
                            <p className="font-mono text-tag tracking-[0.14em] text-ink-muted uppercase">
                                {t(
                                    request.signedIn
                                        ? "aiAgentsPage.capabilities.examples.signedIn"
                                        : "aiAgentsPage.capabilities.examples.public",
                                )}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </LandingSection>
    );
}
