import { ArrowUpRight, CodeXml } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import {
    COMPARISON_SCROLL_MARGIN_CLASS,
    COMPARISON_SPLIT_CLASS,
    ComparisonHeading,
} from "@/features/comparison/components/ComparisonLayout.tsx";
import { COMPARISON_AGENTS_SECTION_ID } from "@/features/comparison/config/comparisonDefinition.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

export const MCP_SERVER_URL = "https://mcp.aura-historia.com/v1";
export const API_DOCUMENTATION_URL = "https://docs.api.aura-historia.com";
export const MCP_DOCUMENTATION_URL = "https://docs.api.aura-historia.com/mcp.md";

const FACTS = [
    { key: "mcpServer", value: `${MCP_SERVER_URL} · Streamable HTTP` },
    { key: "restApi", value: API_DOCUMENTATION_URL },
    { key: "publicListings", value: null },
] as const;

/**
 * The AI-assistants side-note on every comparison page: its own band on the sunken ground, directly
 * under the hero and the jump nav. A `section` with an h2 (not an `aside`) so extractors read it as
 * main content. It states facts about Aura Historia only: no verdict, no comparison.
 */
export function ComparisonAgentsSection() {
    const { t } = useTranslation();

    return (
        <section
            id={COMPARISON_AGENTS_SECTION_ID}
            aria-labelledby="comparison-agents-heading"
            className={cn(
                "border-b border-line-subtle bg-surface-sunken px-(--page-gutter) py-12 text-ink sm:py-[clamp(56px,6vw,88px)]",
                COMPARISON_SCROLL_MARGIN_CLASS,
            )}
        >
            <div className={cn("mx-auto w-full max-w-content items-start", COMPARISON_SPLIT_CLASS)}>
                <div className="flex flex-col gap-5">
                    <p className="inline-flex items-center gap-2 font-mono text-kicker text-brass-ink uppercase sm:gap-2.5">
                        <CodeXml className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                        {t("comparison.agents.eyebrow")}
                    </p>
                    <ComparisonHeading
                        id="comparison-agents-heading"
                        className="text-[32px] leading-[1.08] sm:text-[clamp(34px,3.6vw,52px)] sm:leading-[1.06]"
                    >
                        <Trans i18nKey="comparison.agents.title" components={HEADLINE_COMPONENTS} />
                    </ComparisonHeading>
                </div>
                <div className="flex flex-col gap-5 border-t border-ink pt-5 sm:gap-6 sm:pt-6">
                    <p className="max-w-[680px] text-base leading-[1.6] text-ink-secondary sm:text-body-lg sm:leading-[1.65]">
                        {t("comparison.agents.body")}
                    </p>
                    <dl className="border-t border-line">
                        {FACTS.map((fact) => (
                            <div
                                key={fact.key}
                                className="flex flex-col gap-1 border-b border-line py-3 sm:grid sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-6"
                            >
                                <dt className="font-mono text-label tracking-[0.14em] text-ink-muted uppercase sm:leading-5">
                                    {t(`comparison.agents.facts.${fact.key}.label`)}
                                </dt>
                                <dd className="font-mono text-[13px] leading-5 [overflow-wrap:anywhere] text-ink">
                                    {fact.value ?? t(`comparison.agents.facts.${fact.key}.value`)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3">
                        <a
                            href={MCP_DOCUMENTATION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-medium text-ink transition-shadow hover:shadow-[inset_0_-1px_0_var(--ink)]",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            {t("comparison.agents.docsLink")}
                            <ArrowUpRight
                                className="size-4 shrink-0"
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </a>
                        <p className="text-meta text-ink-muted">{t("comparison.agents.closing")}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
