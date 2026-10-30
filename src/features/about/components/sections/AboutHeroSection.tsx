import { Trans, useTranslation } from "react-i18next";

import { ABOUT_SECTION_IDS, type AboutSectionId } from "@/features/about/config/aboutPage.data";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const JUMP_LINKS: readonly AboutSectionId[] = [
    ABOUT_SECTION_IDS.services,
    ABOUT_SECTION_IDS.difference,
    ABOUT_SECTION_IDS.audience,
    ABOUT_SECTION_IDS.team,
    ABOUT_SECTION_IDS.faq,
];

/** Ink hero: editorial headline, the plain one-sentence definition as the lead, and the chapter links. */
export function AboutHeroSection() {
    const { t } = useTranslation();
    const navLabel = t("aboutPage.hero.navLabel");

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
                <nav
                    aria-label={navLabel}
                    className="mt-4 sm:mt-[clamp(24px,3vw,40px)] sm:flex sm:flex-wrap sm:items-center sm:gap-x-7 sm:border-t sm:border-line sm:pt-3"
                >
                    <span
                        aria-hidden="true"
                        className="hidden font-mono text-kicker text-ink-muted uppercase sm:inline"
                    >
                        {navLabel}
                    </span>
                    <ul className="-mx-(--page-gutter) flex gap-2 overflow-x-auto px-(--page-gutter) [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-x-7 sm:gap-y-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                        {JUMP_LINKS.map((sectionId) => (
                            <li key={sectionId} className="shrink-0">
                                <a
                                    href={`#${sectionId}`}
                                    className={cn(
                                        "inline-flex h-11 items-center rounded-pill px-4 text-meta text-ink-secondary shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors hover:text-brass sm:h-auto sm:min-h-11 sm:rounded-none sm:px-0 sm:text-body-sm sm:shadow-none",
                                        NAV_FOCUS_CLASS,
                                    )}
                                >
                                    {t(`aboutPage.hero.nav.${sectionId}`)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </section>
    );
}
