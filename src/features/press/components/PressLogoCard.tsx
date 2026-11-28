import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { OUTLINE_PILL_BUTTON_CLASS } from "@/components/common/outlinePillButtonClass.ts";
import {
    LOGO_FORMATS,
    type PressLogo,
    type PressLogoGround,
    pressLogoUrl,
} from "@/features/press/config/pressPage.data.ts";
import {
    PRESS_CARD_TITLE_CLASS,
    PRESS_LABEL_CLASS,
    PRESS_PANEL_CLASS,
} from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

const GROUND_CLASS: Record<PressLogoGround, string> = {
    parchment: "bg-surface",
    ink: "bg-surface",
    oxblood: "bg-oxblood",
};

/**
 * Preview widths that draw every mark at the same size: the oxblood files carry their own ground
 * and clear space, so they are shown wider for the letters inside to match.
 */
function previewWidthClass(logo: PressLogo): string {
    if (logo.layout === "inline") {
        return logo.ground === "oxblood" ? "w-[min(259px,100%)]" : "w-[min(221px,100%)]";
    }
    return logo.ground === "oxblood" ? "w-[min(307px,100%)]" : "w-[min(240px,100%)]";
}

/** One logo: a preview on its ground, its name and use, and SVG and PNG downloads. */
export function PressLogoCard({ logo }: { readonly logo: PressLogo }) {
    const { t } = useTranslation();
    const title = t(`pressPage.logo.cards.${logo.id}.title`);

    return (
        <article className={cn(PRESS_PANEL_CLASS, "flex flex-col overflow-hidden")}>
            <div
                data-theme={logo.ground === "ink" ? "dark" : "light"}
                className={cn(
                    "flex h-[200px] items-center justify-center p-8 shadow-[inset_0_-1px_0_var(--line-subtle)] sm:h-60",
                    GROUND_CLASS[logo.ground],
                )}
            >
                <img
                    src={pressLogoUrl(logo, "svg")}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className={cn("h-auto max-h-full", previewWidthClass(logo))}
                />
            </div>
            <div className="flex flex-1 flex-col gap-2 px-6 pt-6 pb-5">
                <h3 className={PRESS_CARD_TITLE_CLASS}>{title}</h3>
                <p className={PRESS_LABEL_CLASS}>{t(`pressPage.logo.cards.${logo.id}.meta`)}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {LOGO_FORMATS.map((format) => (
                        <a
                            key={format}
                            href={pressLogoUrl(logo, format)}
                            download
                            aria-label={t("pressPage.logo.downloadAs", {
                                name: title,
                                format: format.toUpperCase(),
                            })}
                            className={cn(OUTLINE_PILL_BUTTON_CLASS, "px-4")}
                        >
                            <Download
                                aria-hidden="true"
                                className="size-[15px]"
                                strokeWidth={1.8}
                            />
                            {format.toUpperCase()}
                        </a>
                    ))}
                </div>
            </div>
        </article>
    );
}
