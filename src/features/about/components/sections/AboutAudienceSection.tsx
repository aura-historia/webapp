import { Trans, useTranslation } from "react-i18next";

import { ABOUT_SECTION_IDS } from "@/features/about/config/aboutPage.data";
import { ABOUT_SPLIT_CLASS } from "@/features/about/lib/aboutStyles.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const AUDIENCE_GROUPS = [
    {
        id: "collectors",
        items: ["privateCollectors", "specialists", "decorators", "heirs"],
    },
    {
        id: "trade",
        items: ["dealers", "auctionHouses", "researchers", "partners"],
    },
] as const;

/** III — Audience, on ink: the exact groups who use Aura Historia, as ruled bullet lists. */
export function AboutAudienceSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="ink"
            id={ABOUT_SECTION_IDS.audience}
            labelledBy="about-audience-heading"
            containerClassName={cn(ABOUT_SPLIT_CLASS, "items-start gap-9 sm:gap-12")}
        >
            <SectionHeading
                id="about-audience-heading"
                onInk
                eyebrow={`III — ${t("aboutPage.audience.eyebrow")}`}
                title={
                    <Trans i18nKey="aboutPage.audience.title" components={HEADLINE_COMPONENTS} />
                }
                intro={t("aboutPage.audience.description")}
            />
            <div className="grid gap-9 min-[760px]:grid-cols-2 min-[760px]:gap-12">
                {AUDIENCE_GROUPS.map((group) => (
                    <div key={group.id} className="flex flex-col gap-3 sm:gap-4">
                        <h3 className="font-mono text-kicker font-normal text-ink-muted uppercase">
                            {t(`aboutPage.audience.groups.${group.id}.heading`)}
                        </h3>
                        <ul className="border-b border-line">
                            {group.items.map((item) => (
                                <li
                                    key={item}
                                    className="grid grid-cols-[14px_minmax(0,1fr)] items-baseline gap-2.5 border-t border-line py-3.5 text-body leading-[1.55] sm:gap-3 sm:py-4"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="size-1.5 -translate-y-0.5 rounded-full bg-brass"
                                    />
                                    <span>
                                        {t(`aboutPage.audience.groups.${group.id}.items.${item}`)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </LandingSection>
    );
}
