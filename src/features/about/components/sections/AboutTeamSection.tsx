import { Trans, useTranslation } from "react-i18next";

import { AboutTeamMemberCard } from "@/features/about/components/AboutTeamMemberCard.tsx";
import { ABOUT_SECTION_IDS, ABOUT_TEAM_MEMBERS } from "@/features/about/config/aboutPage.data";
import { ABOUT_SPLIT_CLASS } from "@/features/about/lib/aboutStyles.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

/** IV — People: the origin story beside the heading, then one card per team member. */
export function AboutTeamSection() {
    const { t } = useTranslation();
    const visibleTeamMembers = ABOUT_TEAM_MEMBERS.filter((member) => !member.hidden);

    return (
        <LandingSection
            ground="surface"
            id={ABOUT_SECTION_IDS.team}
            labelledBy="about-team-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <div className={cn(ABOUT_SPLIT_CLASS, "items-start")}>
                <SectionHeading
                    id="about-team-heading"
                    eyebrow={`IV — ${t("aboutPage.team.eyebrow")}`}
                    title={
                        <Trans i18nKey="aboutPage.team.title" components={HEADLINE_COMPONENTS} />
                    }
                />
                <div className="flex flex-col gap-4 text-base leading-relaxed text-pretty text-ink-secondary sm:gap-5 sm:text-body-lg min-[1080px]:pt-2">
                    <p>{t("aboutPage.team.story.origin")}</p>
                    <p>{t("aboutPage.team.story.today")}</p>
                </div>
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visibleTeamMembers.map((member) => (
                    <AboutTeamMemberCard key={member.id} member={member} />
                ))}
            </div>
        </LandingSection>
    );
}
