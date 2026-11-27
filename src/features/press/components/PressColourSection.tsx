import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { CopyTextButton } from "@/components/common/CopyTextButton.tsx";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import { PressSectionOpener } from "@/features/press/components/PressSectionOpener.tsx";
import {
    BRAND_COLOURS,
    type BrandColour,
    PRESS_SECTION_IDS,
} from "@/features/press/config/pressPage.data.ts";
import { PRESS_CARD_TITLE_CLASS } from "@/features/press/lib/pressStyles.ts";

function ColourSwatch({ colour }: { readonly colour: BrandColour }) {
    const { t } = useTranslation();
    const hexRef = useRef<HTMLElement>(null);
    const name = t(`pressPage.colour.swatches.${colour.id}.name`);

    return (
        <li className="flex flex-col overflow-hidden rounded-card bg-surface shadow-ring">
            <div
                aria-hidden="true"
                // The published value itself, not a theme token: the swatch must show it exactly.
                style={{ backgroundColor: colour.hex }}
                className="h-24 shadow-[inset_0_-1px_0_var(--line-subtle)] sm:h-[140px]"
            />
            <div className="flex flex-col gap-3 px-6 py-5">
                <div className="flex flex-col gap-1">
                    <h3 className={PRESS_CARD_TITLE_CLASS}>{name}</h3>
                    <p className="text-body-sm leading-normal text-ink-secondary">
                        {t(`pressPage.colour.swatches.${colour.id}.role`)}
                    </p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-xs tracking-[0.06em]">
                        <dt className="text-ink-muted">{t("pressPage.colour.hex")}</dt>
                        <dd ref={hexRef}>{colour.hex}</dd>
                        <dt className="text-ink-muted">{t("pressPage.colour.rgb")}</dt>
                        <dd>{colour.rgb}</dd>
                    </dl>
                    <CopyTextButton
                        text={colour.hex}
                        targetRef={hexRef}
                        label={t("pressPage.colour.copyLabel", { name })}
                        copiedLabel={t("pressPage.colour.copiedLabel", { name })}
                        className="px-3.5 text-meta"
                    />
                </div>
            </div>
        </li>
    );
}

/** IV — Colour: the six brand colours with hex and RGB values; Copy takes the hex value. */
export function PressColourSection() {
    const { t } = useTranslation();

    return (
        <LandingSection
            ground="raised"
            id={PRESS_SECTION_IDS.colour}
            labelledBy="press-colour-heading"
            containerClassName="flex flex-col gap-9 sm:gap-14"
        >
            <PressSectionOpener
                headingId="press-colour-heading"
                eyebrow={`IV — ${t("pressPage.colour.eyebrow")}`}
                titleKey="pressPage.colour.title"
                intro={t("pressPage.colour.description")}
            />
            <ul className="grid gap-5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
                {BRAND_COLOURS.map((colour) => (
                    <ColourSwatch key={colour.id} colour={colour} />
                ))}
            </ul>
        </LandingSection>
    );
}
