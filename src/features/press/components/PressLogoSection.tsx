import { Download, X } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { OUTLINE_PILL_BUTTON_CLASS } from "@/components/common/outlinePillButtonClass.ts";
import {
    WORDMARK_PATH,
    WORDMARK_VIEW_BOX,
    Wordmark,
} from "@/features/app-shell/components/navigation/Wordmark.tsx";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { PressLogoCard } from "@/features/press/components/PressLogoCard.tsx";
import { PressSectionOpener } from "@/features/press/components/PressSectionOpener.tsx";
import {
    BRAND_KIT_URL,
    LOGO_MISUSES,
    type LogoMisuse,
    PRESS_LOGOS,
    PRESS_SECTION_IDS,
    pressLogoUrl,
} from "@/features/press/config/pressPage.data.ts";
import { PRESS_CARD_TITLE_CLASS, PRESS_PANEL_CLASS } from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

const STRONG_COMPONENTS = { strong: <strong className="font-medium text-ink" /> };

/** Each wrong example drawn as it would look; the marks are decoration, the caption says it. */
function MisuseMark({ misuse }: { readonly misuse: LogoMisuse }) {
    if (misuse === "loupe") {
        return (
            <svg
                aria-hidden="true"
                viewBox={WORDMARK_VIEW_BOX}
                fill="none"
                className="h-4 w-auto sm:h-[18px]"
            >
                <path d={WORDMARK_PATH} fill="currentColor" />
            </svg>
        );
    }
    return (
        <Wordmark
            label=""
            className={cn(
                "h-4 sm:h-[18px]",
                misuse === "stretched" && "scale-x-[1.45]",
                // Brass is a brand colour, but never the wordmark's.
                misuse === "recoloured" && "text-brass",
                misuse === "effects" && "drop-shadow-[3px_4px_3px_rgba(0,0,0,0.45)]",
            )}
        />
    );
}

function ClearSpaceFigure() {
    const marker = "absolute font-mono text-label text-brass-ink";

    return (
        <figure className={cn(PRESS_PANEL_CLASS, "m-0 flex flex-col gap-5 p-5 sm:p-8")}>
            <h3 className={cn(PRESS_CARD_TITLE_CLASS, "sm:text-title-md")}>
                <Trans i18nKey="pressPage.logo.clearSpace.title" components={HEADLINE_COMPONENTS} />
            </h3>
            <div
                aria-hidden="true"
                className="relative self-center bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--brass)_10%,transparent)_0_6px,transparent_6px_12px)] px-8 py-7 outline-1 -outline-offset-1 outline-brass outline-dashed sm:px-14 sm:py-11"
            >
                <div className="bg-surface-raised shadow-[0_0_0_1px_var(--line-subtle)]">
                    <img
                        src={pressLogoUrl(PRESS_LOGOS[0], "svg")}
                        alt=""
                        aria-hidden="true"
                        className="h-auto w-[min(200px,52vw)]"
                    />
                </div>
                <span className={cn(marker, "top-1 left-1/2 -translate-x-1/2")}>x</span>
                <span className={cn(marker, "bottom-1 left-1/2 -translate-x-1/2")}>x</span>
                <span className={cn(marker, "top-1/2 left-2 -translate-y-1/2")}>x</span>
                <span className={cn(marker, "top-1/2 right-2 -translate-y-1/2")}>x</span>
            </div>
            <figcaption className="flex flex-col gap-2 text-body text-ink-secondary">
                <p>
                    <Trans
                        i18nKey="pressPage.logo.clearSpace.spacing"
                        components={STRONG_COMPONENTS}
                    />
                </p>
                <p>
                    <Trans
                        i18nKey="pressPage.logo.clearSpace.minimum"
                        components={STRONG_COMPONENTS}
                    />
                </p>
            </figcaption>
        </figure>
    );
}

function MisusePanel() {
    const { t } = useTranslation();

    return (
        <div className={cn(PRESS_PANEL_CLASS, "flex flex-col gap-5 p-5 sm:p-8")}>
            <h3 className={cn(PRESS_CARD_TITLE_CLASS, "sm:text-title-md")}>
                <Trans i18nKey="pressPage.logo.misuse.title" components={HEADLINE_COMPONENTS} />
            </h3>
            <ul className="grid grid-cols-2 gap-4">
                {LOGO_MISUSES.map((misuse) => (
                    <li key={misuse} className="flex flex-col gap-2.5">
                        <div
                            aria-hidden="true"
                            className="relative flex h-[84px] items-center justify-center overflow-hidden rounded-md bg-surface text-ink shadow-field sm:h-28"
                        >
                            <MisuseMark misuse={misuse} />
                            <span className="absolute top-2 right-2 inline-flex size-[22px] items-center justify-center rounded-full bg-oxblood text-on-oxblood">
                                <X className="size-[11px]" strokeWidth={2.6} />
                            </span>
                        </div>
                        <p className="text-body-sm leading-normal text-ink-secondary">
                            {t(`pressPage.logo.misuse.${misuse}`)}
                        </p>
                    </li>
                ))}
            </ul>
            <p className="border-t border-line-subtle pt-4 text-body-sm text-ink-secondary">
                {t("pressPage.logo.misuse.more")}
            </p>
        </div>
    );
}

/** III — Logo: six downloads, clear space and minimum size, and what not to do. */
export function PressLogoSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="surface"
            id={PRESS_SECTION_IDS.logo}
            labelledBy="press-logo-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <PressSectionOpener
                headingId="press-logo-heading"
                eyebrow={`III — ${t("pressPage.logo.eyebrow")}`}
                titleKey="pressPage.logo.title"
                intro={t("pressPage.logo.description")}
            >
                <a href={BRAND_KIT_URL} download className={OUTLINE_PILL_BUTTON_CLASS}>
                    <Download aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    {t("pressPage.logo.downloadAll")}
                </a>
            </PressSectionOpener>
            <div className="grid gap-5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
                {PRESS_LOGOS.map((logo) => (
                    <PressLogoCard key={logo.id} logo={logo} />
                ))}
            </div>
            <div className="grid gap-5 min-[1080px]:grid-cols-2">
                <ClearSpaceFigure />
                <MisusePanel />
            </div>
        </LandingSection>
    );
}
