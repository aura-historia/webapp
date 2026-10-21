import type { ReactNode } from "react";
import { Trans } from "react-i18next";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";

type AuthFormHeaderProps = {
    /** Mono eyebrow above the headline; it is uppercased. */
    readonly eyebrow: string;
    /** Translation key of the serif headline; its closing phrase is wrapped in `<em>`. */
    readonly titleKey: string;
    readonly lead: ReactNode;
};

/** Eyebrow, serif headline and lead that open every step of the auth flow. */
export function AuthFormHeader({ eyebrow, titleKey, lead }: AuthFormHeaderProps) {
    return (
        <header className="flex flex-col gap-3">
            <p className="font-mono text-eyebrow text-brass-ink uppercase">{eyebrow}</p>
            <h1 className="font-serif text-[38px] leading-[1.04] font-normal tracking-[-0.02em] text-ink sm:text-[46px] [&_em]:italic">
                <Trans i18nKey={titleKey} components={HEADLINE_COMPONENTS} />
            </h1>
            <p className="text-body text-ink-secondary wrap-anywhere">{lead}</p>
        </header>
    );
}
