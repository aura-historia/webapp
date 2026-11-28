import { Trans, useTranslation } from "react-i18next";

import { OnThisPageNav } from "@/components/common/OnThisPageNav.tsx";
import { ABOUT_SECTION_IDS, type AboutSectionId } from "@/features/about/config/aboutPage.data";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";

const JUMP_LINKS: readonly AboutSectionId[] = Object.values(ABOUT_SECTION_IDS);

/** Ink hero: editorial headline, the plain one-sentence definition as the lead, and the chapter links. */
export function AboutHeroSection() {
    const { t } = useTranslation();

    return (
        <section
            aria-labelledby="about-title"
            data-theme="dark"
            className="bg-surface px-(--page-gutter) pt-14 pb-10 text-ink sm:pt-[clamp(72px,9vw,128px)] sm:pb-[clamp(48px,5vw,72px)]"
        >
            <div className="mx-auto flex w-full max-w-content flex-col gap-5 sm:gap-7">
                <p className="font-mono text-[11px] tracking-[0.2em] text-brass-light uppercase sm:text-eyebrow">
                    {t("aboutPage.hero.eyebrow")}
                </p>
                <h1
                    id="about-title"
                    className="max-w-[1000px] font-serif text-[44px] leading-[1.02] font-normal tracking-[-0.025em] text-balance sm:text-[clamp(46px,6vw,92px)] [&_em]:text-brass-light [&_em]:italic"
                >
                    <Trans i18nKey="aboutPage.hero.title" components={HEADLINE_COMPONENTS} />
                </h1>
                <p className="max-w-[760px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                    {t("aboutPage.hero.subtitle")}
                </p>
                <OnThisPageNav
                    label={t("aboutPage.hero.navLabel")}
                    links={JUMP_LINKS.map((id) => ({ id, label: t(`aboutPage.hero.nav.${id}`) }))}
                />
            </div>
        </section>
    );
}
