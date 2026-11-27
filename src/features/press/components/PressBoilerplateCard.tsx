import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { CopyTextButton } from "@/components/common/CopyTextButton.tsx";
import {
    PRESS_CARD_TITLE_CLASS,
    PRESS_LABEL_CLASS,
    PRESS_PANEL_CLASS,
} from "@/features/press/lib/pressStyles.ts";
import { cn } from "@/lib/utils.ts";

interface PressBoilerplateCardProps {
    readonly length: "short" | "long";
}

/** One description to quote, with its length and a Copy button. */
export function PressBoilerplateCard({ length }: PressBoilerplateCardProps) {
    const { t } = useTranslation();
    const textRef = useRef<HTMLParagraphElement>(null);
    const headingId = `press-boilerplate-${length}`;
    const text = t(`pressPage.descriptions.${length}.text`);
    const words = text.trim().split(/\s+/).length;

    return (
        <article
            aria-labelledby={headingId}
            className={cn(PRESS_PANEL_CLASS, "flex flex-col gap-4 p-5 sm:p-7")}
        >
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h3 id={headingId} className={PRESS_CARD_TITLE_CLASS}>
                        {t(`pressPage.descriptions.${length}.heading`)}
                    </h3>
                    <p className={PRESS_LABEL_CLASS}>
                        {t("pressPage.descriptions.count", {
                            words,
                            characters: text.length,
                        })}
                    </p>
                </div>
                <CopyTextButton
                    text={text}
                    targetRef={textRef}
                    idleText={t("pressPage.descriptions.copyText")}
                    label={t(`pressPage.descriptions.${length}.copyLabel`)}
                    copiedLabel={t(`pressPage.descriptions.${length}.copiedLabel`)}
                />
            </div>
            <p
                ref={textRef}
                className={cn(
                    "border-t border-line pt-4 font-serif leading-[1.6] text-pretty text-ink",
                    length === "long" ? "text-[17px] sm:text-lg" : "text-[17px] sm:text-xl",
                )}
            >
                {text}
            </p>
        </article>
    );
}
