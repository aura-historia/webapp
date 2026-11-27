import { Link } from "@tanstack/react-router";
import { ArrowRight, Image } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { OUTLINE_PILL_BUTTON_CLASS } from "@/components/common/outlinePillButtonClass.ts";
import { ABOUT_SECTION_IDS } from "@/features/about/config/aboutPage.data";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { PressSectionOpener } from "@/features/press/components/PressSectionOpener.tsx";
import { PRESS_SECTION_IDS } from "@/features/press/config/pressPage.data.ts";
import { PRESS_PANEL_CLASS, PRESS_TEXT_LINK_CLASS } from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

/**
 * VI — Images: screenshots and portraits are not published yet, so images are sent on request.
 * Once they exist, this panel gives way to a grid of image cards (Redesign, "Press & brand ·
 * States", D).
 */
export function PressImagesSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={PRESS_SECTION_IDS.images}
            labelledBy="press-images-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <PressSectionOpener
                headingId="press-images-heading"
                eyebrow={`VI — ${t("pressPage.images.eyebrow")}`}
                titleKey="pressPage.images.title"
                intro={t("pressPage.images.description")}
            />
            <div
                className={cn(
                    PRESS_PANEL_CLASS,
                    "flex flex-col items-center gap-4 px-5 py-10 text-center sm:px-8 sm:py-16",
                )}
            >
                <span
                    aria-hidden="true"
                    className="inline-flex size-14 items-center justify-center rounded-full bg-surface text-ink shadow-ring"
                >
                    <Image className="size-6" strokeWidth={1.6} />
                </span>
                <h3 className="font-serif text-[30px] leading-[1.15] font-normal [&_em]:italic">
                    <Trans i18nKey="pressPage.images.emptyTitle" components={HEADLINE_COMPONENTS} />
                </h3>
                <p className="max-w-[520px] text-body text-ink-secondary">
                    {t("pressPage.images.emptyBody")}
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                    <a href={`#${PRESS_SECTION_IDS.contact}`} className={OUTLINE_PILL_BUTTON_CLASS}>
                        {t("pressPage.images.request")}
                    </a>
                    <Link
                        to="/$lng/about-us"
                        hash={ABOUT_SECTION_IDS.team}
                        params={true}
                        from="/$lng"
                        className={cn(PRESS_TEXT_LINK_CLASS, "self-center px-2")}
                    >
                        {t("pressPage.images.team")}
                        <ArrowRight aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    </Link>
                </div>
            </div>
        </LandingSection>
    );
}
