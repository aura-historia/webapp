import { Trans, useTranslation } from "react-i18next";

import { McpAddress } from "@/features/ai-agents/components/McpAddress.tsx";
import {
    AI_AGENTS_SECTION_IDS,
    type AiAgentsSectionId,
} from "@/features/ai-agents/config/aiAgentsPage.data.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const JUMP_LINKS: readonly AiAgentsSectionId[] = Object.values(AI_AGENTS_SECTION_IDS);

/** Ink hero: what the page is for in one sentence, the server address to copy, and the chapter links. */
export function AiAgentsHeroSection() {
    const { t } = useTranslation();
    const navLabel = t("aiAgentsPage.hero.navLabel");

    return (
        <section
            aria-labelledby="ai-agents-title"
            data-theme="dark"
            className="bg-surface px-(--page-gutter) pt-14 pb-10 text-ink sm:pt-[clamp(72px,9vw,128px)] sm:pb-[clamp(40px,4vw,56px)]"
        >
            <div className="mx-auto flex w-full max-w-content flex-col gap-5 sm:gap-7">
                <p className="font-mono text-[11px] tracking-[0.2em] text-brass-light uppercase sm:text-eyebrow">
                    {t("aiAgentsPage.hero.eyebrow")}
                </p>
                <h1
                    id="ai-agents-title"
                    className="max-w-[980px] font-serif text-[44px] leading-[1.02] font-normal tracking-[-0.025em] text-balance sm:text-[clamp(48px,6.4vw,96px)] sm:leading-none [&_em]:text-brass-light [&_em]:italic"
                >
                    <Trans i18nKey="aiAgentsPage.hero.title" components={HEADLINE_COMPONENTS} />
                </h1>
                <p className="max-w-[720px] text-base leading-[1.55] text-pretty text-ink-secondary sm:text-lead">
                    {t("aiAgentsPage.hero.subtitle")}
                </p>

                <div className="flex max-w-[720px] flex-col gap-2.5">
                    <p className="font-mono text-label tracking-[0.14em] text-ink-muted uppercase">
                        {t("aiAgentsPage.hero.addressLabel")}
                    </p>
                    <McpAddress variant="hero" />
                    <p className="text-body-sm leading-[1.55] text-ink-muted">
                        {t("aiAgentsPage.hero.noAccount")}
                    </p>
                </div>

                <nav
                    aria-label={navLabel}
                    className="mt-4 sm:mt-5 sm:border-t sm:border-line sm:pt-3"
                >
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
                                    {t(`aiAgentsPage.hero.nav.${sectionId}`)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </section>
    );
}
