import { Trans, useTranslation } from "react-i18next";

import { AiAgentsConnectTabs } from "@/features/ai-agents/components/AiAgentsConnectTabs.tsx";
import { AI_AGENTS_SECTION_IDS } from "@/features/ai-agents/config/aiAgentsPage.data.ts";
import {
    AI_AGENTS_INTRO_CLASS,
    AI_AGENTS_SPLIT_CLASS,
} from "@/features/ai-agents/lib/aiAgentsStyles.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

/** II — Connect: one tab per assistant, then the plain trademark disclaimer. */
export function AiAgentsConnectSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="sunken"
            id={AI_AGENTS_SECTION_IDS.connect}
            labelledBy="ai-agents-connect-heading"
            containerClassName="flex flex-col gap-9 sm:gap-12"
        >
            <div className={cn(AI_AGENTS_SPLIT_CLASS, "items-end")}>
                <SectionHeading
                    id="ai-agents-connect-heading"
                    eyebrow={`II — ${t("aiAgentsPage.connect.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="aiAgentsPage.connect.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className={AI_AGENTS_INTRO_CLASS}>{t("aiAgentsPage.connect.description")}</p>
            </div>
            <AiAgentsConnectTabs />
            <p className="max-w-[880px] text-meta leading-[1.55] text-ink-muted">
                {t("aiAgentsPage.connect.disclaimer")}
            </p>
        </LandingSection>
    );
}
