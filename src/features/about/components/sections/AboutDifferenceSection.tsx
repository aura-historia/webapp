import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { ABOUT_SECTION_IDS } from "@/features/about/config/aboutPage.data";
import { ABOUT_SPLIT_CLASS, ABOUT_TEXT_LINK_CLASS } from "@/features/about/lib/aboutStyles.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V"] as const;

/** Each difference carries a figure; those quoting an outside number name its source. */
const DIFFERENCES = [
    { id: "market", hasSource: true },
    { id: "alerts", hasSource: false },
    { id: "languages", hasSource: false },
    { id: "current", hasSource: false },
    { id: "seller", hasSource: true },
] as const;

/**
 * II — The difference: five ruled rows (numeral, title, figure, copy). Phones stack the row beside
 * the numeral; from 768px the copy runs under title and figure; from 1180px it is one line.
 */
export function AboutDifferenceSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="raised"
            id={ABOUT_SECTION_IDS.difference}
            labelledBy="about-difference-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <div className={cn(ABOUT_SPLIT_CLASS, "items-end")}>
                <SectionHeading
                    id="about-difference-heading"
                    eyebrow={`II — ${t("aboutPage.difference.eyebrow")}`}
                    title={
                        <Trans
                            i18nKey="aboutPage.difference.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    }
                />
                <p className="max-w-[540px] text-base leading-relaxed text-pretty text-ink-secondary sm:text-body-lg">
                    {t("aboutPage.difference.description")}
                </p>
            </div>
            <ol className="border-b border-line">
                {DIFFERENCES.map((item, index) => (
                    <li
                        key={item.id}
                        className="grid grid-cols-[48px_minmax(0,1fr)] gap-x-3 gap-y-3 border-t border-ink py-[22px] md:grid-cols-[64px_minmax(0,1fr)_200px] md:gap-x-7 md:py-7 min-[1180px]:grid-cols-[64px_minmax(0,0.9fr)_220px_minmax(0,1.2fr)] min-[1180px]:items-baseline"
                    >
                        <span
                            aria-hidden="true"
                            className="row-span-3 font-serif text-[34px] leading-none text-oxblood md:row-span-2 md:text-[44px] min-[1180px]:row-span-1"
                        >
                            {ROMAN_NUMERALS[index]}
                        </span>
                        <h3 className="font-serif text-[22px] leading-[1.2] font-normal sm:text-title-md">
                            {t(`aboutPage.difference.items.${item.id}.title`)}
                        </h3>
                        <p className="flex flex-col gap-1">
                            <span className="font-serif text-[30px] leading-[1.1] sm:text-stat">
                                {t(`aboutPage.difference.items.${item.id}.figure`)}
                            </span>
                            <span className="font-mono text-label text-ink-muted uppercase">
                                {t(`aboutPage.difference.items.${item.id}.figureLabel`)}
                            </span>
                        </p>
                        <div className="flex flex-col gap-2 md:col-span-2 min-[1180px]:col-span-1">
                            <p className="max-w-[620px] text-body text-ink-secondary">
                                {t(`aboutPage.difference.items.${item.id}.description`)}
                            </p>
                            {item.hasSource && (
                                <p className="font-mono text-label text-balance text-ink-muted uppercase">
                                    {t(`aboutPage.difference.items.${item.id}.source`)}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
            <Link
                to="/$lng/compare/barnebys"
                params={true}
                from="/$lng"
                className={cn(ABOUT_TEXT_LINK_CLASS, "gap-2.5 text-[15px]", NAV_FOCUS_CLASS)}
            >
                {t("aboutPage.difference.comparisonLink")}
                <ArrowRight className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            </Link>
        </LandingSection>
    );
}
