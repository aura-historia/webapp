import type { ReactNode } from "react";
import { Trans } from "react-i18next";

import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { PRESS_INTRO_CLASS, PRESS_SPLIT_CLASS } from "@/features/press/lib/pressStyles.ts";

interface PressSectionOpenerProps {
    /** The h2's id, which labels the section. */
    readonly headingId: string;
    /** "I — Fact sheet", already translated. */
    readonly eyebrow: string;
    /** Translation key of the headline; its closing phrase is in `<em>`. */
    readonly titleKey: string;
    readonly intro: ReactNode;
    readonly onInk?: boolean;
    /** Shown under the intro, such as a download link. */
    readonly children?: ReactNode;
}

/** A chapter opener: eyebrow and headline on the left, the intro beside them from 1080px. */
export function PressSectionOpener({
    headingId,
    eyebrow,
    titleKey,
    intro,
    onInk = false,
    children,
}: PressSectionOpenerProps) {
    return (
        <div className={PRESS_SPLIT_CLASS}>
            <SectionHeading
                id={headingId}
                onInk={onInk}
                eyebrow={eyebrow}
                title={<Trans i18nKey={titleKey} components={HEADLINE_COMPONENTS} />}
            />
            <div className="flex flex-col items-start gap-5">
                <p className={PRESS_INTRO_CLASS}>{intro}</p>
                {children}
            </div>
        </div>
    );
}
