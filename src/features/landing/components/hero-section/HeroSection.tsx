import { Trans, useTranslation } from "react-i18next";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { HeroSearch } from "@/features/landing/components/hero-section/HeroSearch.tsx";
import { HeroStats } from "@/features/landing/components/hero-section/HeroStats.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";

const COLUMN_IDS = Array.from({ length: 12 }, (_, index) => `column-${index}`);
const COLUMN_CLASS = "border-l border-[rgba(244,238,227,0.045)] last:border-r";

/** The film grain and faint 12-column hairline grid behind the hero, and nowhere else. */
function HeroBackdrop() {
    return (
        <>
            <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 size-full opacity-[0.09]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <filter id="hero-grain">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.85"
                        numOctaves={3}
                        stitchTiles="stitch"
                    />
                    <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.9  0 0 0 0.9 0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#hero-grain)" />
            </svg>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 grid grid-cols-4 px-(--page-gutter) md:hidden"
            >
                {COLUMN_IDS.slice(0, 4).map((id) => (
                    <div key={id} className={COLUMN_CLASS} />
                ))}
            </div>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 mx-auto hidden max-w-content grid-cols-12 md:grid"
            >
                {COLUMN_IDS.map((id) => (
                    <div key={id} className={COLUMN_CLASS} />
                ))}
            </div>
        </>
    );
}

/**
 * The landing hero on the ink ground: headline, lead, the global search and the stat strip. The
 * header sits over it (the page tucks the hero under the header bar), so the copy clears the
 * header first.
 */
export default function HeroSection() {
    const { t } = useTranslation();

    return (
        <section
            id={LANDING_PAGE_FRAGMENTS.hero}
            aria-labelledby="hero-title"
            data-theme="dark"
            className="relative overflow-hidden bg-surface text-ink"
        >
            <HeroBackdrop />
            <div className="relative mx-auto flex max-w-content flex-col gap-5 px-(--page-gutter) pt-[calc(60px+48px)] pb-16 sm:items-center sm:gap-7 sm:text-center lg:pt-[calc(88px+clamp(56px,8vw,104px))] lg:pb-[clamp(72px,9vw,128px)]">
                <h1
                    id="hero-title"
                    className="max-w-[1100px] font-serif text-[46px] leading-none font-normal tracking-[-0.025em] text-balance sm:text-display-hero [&_em]:text-brass-light [&_em]:italic"
                >
                    <Trans i18nKey="landingPage.hero.title" components={HEADLINE_COMPONENTS} />
                </h1>
                <p className="max-w-[680px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                    {t("landingPage.hero.lead")}
                </p>
                <HeroSearch className="mt-1 max-w-[820px] sm:mt-3" />
                <HeroStats />
            </div>
        </section>
    );
}
