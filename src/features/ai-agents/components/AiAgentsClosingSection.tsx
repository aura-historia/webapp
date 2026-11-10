import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

/** Agent-facing documents, linked rather than repeated on the page. Paths are not translated. */
const AGENT_DOCS = [
    { id: "authMd", href: "/auth.md", mono: true },
    { id: "skills", href: "/.well-known/agent-skills/index.json", mono: false },
    { id: "llmsTxt", href: "/llms.txt", mono: true },
] as const;

/** Ink closing band: a discovery service, purchases with the seller; then the agent documents. */
export function AiAgentsClosingSection() {
    const { t } = useTranslation();

    return (
        <section
            aria-labelledby="ai-agents-closing-heading"
            data-theme="dark"
            className="bg-surface px-(--page-gutter) pt-16 pb-[72px] text-ink sm:py-[clamp(64px,8vw,112px)]"
        >
            <div className="mx-auto flex w-full max-w-content flex-col gap-12">
                <div className="flex flex-col gap-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex max-w-[680px] flex-col gap-3">
                        <h2
                            id="ai-agents-closing-heading"
                            className="font-serif text-[30px] leading-[1.1] font-normal tracking-[-0.01em] text-balance sm:text-[clamp(30px,3vw,44px)] [&_em]:text-brass-light [&_em]:italic"
                        >
                            <Trans
                                i18nKey="aiAgentsPage.closing.title"
                                components={HEADLINE_COMPONENTS}
                            />
                        </h2>
                        <p className="text-base leading-relaxed text-ink-secondary">
                            {t("aiAgentsPage.closing.body")}
                        </p>
                    </div>
                    <Link
                        to="/$lng/search"
                        params={true}
                        from="/$lng"
                        data-theme="light"
                        className={cn(
                            "inline-flex h-[50px] items-center gap-2.5 self-start rounded-pill bg-surface px-6 text-[15px] font-medium text-ink",
                            NAV_FOCUS_CLASS,
                        )}
                    >
                        {t("aiAgentsPage.closing.cta")}
                        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    </Link>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line pt-6">
                    <span className="font-mono text-label tracking-[0.14em] text-ink-muted uppercase">
                        {t("aiAgentsPage.closing.agentsLabel")}
                    </span>
                    {AGENT_DOCS.map((doc) => (
                        <a
                            key={doc.id}
                            href={doc.href}
                            className={cn(
                                "inline-flex min-h-11 items-center text-ink-secondary underline-offset-4 hover:underline",
                                doc.mono ? "font-mono text-meta" : "text-body-sm",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            {t(`aiAgentsPage.closing.docs.${doc.id}`)}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
