import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";

import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { PressSectionOpener } from "@/features/press/components/PressSectionOpener.tsx";
import {
    BRAND_TYPEFACES,
    type BrandTypeface,
    PRESS_SECTION_IDS,
} from "@/features/press/config/pressPage.data.ts";
import {
    PRESS_CARD_TITLE_CLASS,
    PRESS_LABEL_CLASS,
    PRESS_TEXT_LINK_CLASS,
} from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

/** How each typeface sets its specimen and its sample line. */
const SPECIMEN: Record<BrandTypeface["id"], { specimen: string; sample: string }> = {
    newsreader: {
        specimen: "font-serif tracking-[-0.02em] [&_em]:text-brass-light [&_em]:italic",
        sample: "font-serif text-[19px] leading-[1.35] [&_em]:italic",
    },
    geist: {
        specimen: "font-sans tracking-[-0.03em] [&_strong]:font-semibold",
        sample: "font-sans text-body",
    },
    geistMono: {
        specimen: "font-mono tracking-[-0.04em]",
        sample: "font-mono text-[13px] leading-[1.7] tracking-[0.14em] uppercase",
    },
};

/** The large "Aa" in each typeface: upright and italic, regular and semibold, or with figures. */
const SPECIMEN_TEXT: Record<BrandTypeface["id"], ReactNode> = {
    newsreader: (
        <>
            Aa <em>Aa</em>
        </>
    ),
    geist: (
        <>
            Aa <strong>Aa</strong>
        </>
    ),
    geistMono: "Aa 01",
};

/** V — Typography, on ink: the three open-source typefaces with their role and a sample. */
export function PressTypographySection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="ink"
            id={PRESS_SECTION_IDS.typography}
            labelledBy="press-typography-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <PressSectionOpener
                headingId="press-typography-heading"
                onInk
                eyebrow={`V — ${t("pressPage.typography.eyebrow")}`}
                titleKey="pressPage.typography.title"
                intro={t("pressPage.typography.description")}
            />
            <ol className="grid sm:grid-cols-3 sm:gap-x-7">
                {BRAND_TYPEFACES.map((typeface) => (
                    <li
                        key={typeface.id}
                        className="flex flex-col gap-4 border-t border-ink pt-6 pb-9"
                    >
                        <p className={PRESS_LABEL_CLASS}>
                            {t(`pressPage.typography.fonts.${typeface.id}.role`)}
                        </p>
                        <p
                            aria-hidden="true"
                            className={cn(
                                "text-[64px] leading-none sm:text-[clamp(64px,6vw,88px)]",
                                SPECIMEN[typeface.id].specimen,
                            )}
                        >
                            {SPECIMEN_TEXT[typeface.id]}
                        </p>
                        <h3 className={cn(PRESS_CARD_TITLE_CLASS, "sm:text-title-md")}>
                            {typeface.name}
                        </h3>
                        <p className={cn("text-ink-secondary", SPECIMEN[typeface.id].sample)}>
                            <Trans
                                i18nKey={`pressPage.typography.fonts.${typeface.id}.sample`}
                                components={HEADLINE_COMPONENTS}
                            />
                        </p>
                        <a
                            href={typeface.specimenUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(PRESS_TEXT_LINK_CLASS, "mt-auto")}
                        >
                            {t("pressPage.typography.googleFonts", { name: typeface.name })}
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-[13px]"
                                strokeWidth={1.8}
                            />
                            <span className="sr-only"> {t("pressPage.newTab")}</span>
                        </a>
                    </li>
                ))}
            </ol>
        </LandingSection>
    );
}
