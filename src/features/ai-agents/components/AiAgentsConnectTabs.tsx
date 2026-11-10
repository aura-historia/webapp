import { ArrowRight } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { McpAddress } from "@/features/ai-agents/components/McpAddress.tsx";
import {
    ASSISTANT_SETUPS,
    type AssistantId,
    type AssistantSetup,
    assistantFromHash,
    assistantPanelAnchor,
    DEFAULT_ASSISTANT,
} from "@/features/ai-agents/config/aiAgentsPage.data.ts";
import {
    AI_AGENTS_DEV_TAG_CLASS,
    AI_AGENTS_OUTLINE_BUTTON_CLASS,
} from "@/features/ai-agents/lib/aiAgentsStyles.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const NUMERALS = ["I", "II", "III", "IV", "V", "VI"] as const;

function DevelopmentTag({ labelKey }: { readonly labelKey: string }) {
    const { t } = useTranslation();

    return (
        <span className={AI_AGENTS_DEV_TAG_CLASS}>
            <span
                aria-hidden="true"
                className="size-[7px] rounded-full shadow-[inset_0_0_0_1.5px_var(--ink-muted)]"
            />
            {t(labelKey)}
        </span>
    );
}

function SetupSteps({ assistant }: { readonly assistant: AssistantSetup }) {
    const { t } = useTranslation();

    return (
        <ol
            aria-label={t("aiAgentsPage.connect.stepsLabel", { name: assistant.name })}
            className="border-t border-ink"
        >
            {assistant.steps.map((step, index) => (
                <li
                    key={step}
                    className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-4 gap-y-2.5 border-b border-line pt-[22px] pb-6 sm:grid-cols-[44px_minmax(0,1fr)]"
                >
                    <span
                        aria-hidden="true"
                        className="row-span-3 font-serif text-[26px] leading-none text-oxblood"
                    >
                        {NUMERALS[index]}
                    </span>
                    <p className="text-base leading-[1.4] font-medium">
                        {t(`aiAgentsPage.connect.assistants.${assistant.id}.steps.${step}.title`)}
                    </p>
                    <p className="text-body text-ink-secondary">
                        {t(`aiAgentsPage.connect.assistants.${assistant.id}.steps.${step}.body`)}
                    </p>
                    {assistant.addressStep === step && <McpAddress variant="step" />}
                </li>
            ))}
        </ol>
    );
}

function ComingSoon({
    assistant,
    onSelect,
}: {
    readonly assistant: AssistantSetup;
    readonly onSelect: (id: AssistantId) => void;
}) {
    const { t } = useTranslation();
    const alternatives = ASSISTANT_SETUPS.filter((other) => other.steps.length > 0);

    return (
        <div className="flex flex-col gap-5 border-t border-ink pt-7">
            <DevelopmentTag labelKey="aiAgentsPage.connect.soon.status" />
            <p className="font-serif text-[26px] leading-[1.2] [&_em]:italic">
                <Trans
                    i18nKey="aiAgentsPage.connect.soon.title"
                    values={{ name: assistant.name }}
                    components={HEADLINE_COMPONENTS}
                />
            </p>
            <p className="text-body text-ink-secondary">
                {t(`aiAgentsPage.connect.assistants.${assistant.id}.soon`)}
            </p>
            <div className="flex flex-col gap-3 pt-2">
                <p className="font-mono text-label tracking-[0.14em] text-ink-muted uppercase">
                    {t("aiAgentsPage.connect.soon.today")}
                </p>
                <div className="flex flex-wrap gap-2.5">
                    {alternatives.map((other) => (
                        <button
                            key={other.id}
                            type="button"
                            onClick={() => onSelect(other.id)}
                            className={AI_AGENTS_OUTLINE_BUTTON_CLASS}
                        >
                            {other.name}
                            <ArrowRight
                                aria-hidden="true"
                                className="size-[15px]"
                                strokeWidth={1.8}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * One tab per assistant. Every panel is in the server markup (inactive ones hidden), so search engines
 * and directory reviewers can read every step. `#connect-<id>` selects a tab after mount.
 */
export function AiAgentsConnectTabs() {
    const { t } = useTranslation();
    // A fixed default keeps server and client markup alike; the fragment is read after mount.
    const [selected, setSelected] = useState<AssistantId>(DEFAULT_ASSISTANT);
    const tabRefs = useRef<Partial<Record<AssistantId, HTMLButtonElement | null>>>({});
    const tabsRef = useRef<HTMLDivElement>(null);
    const baseId = useId();

    useEffect(() => {
        const applyHash = () => {
            const fromHash = assistantFromHash(window.location.hash);
            if (!fromHash) return;
            setSelected(fromHash);
            tabsRef.current?.scrollIntoView({ block: "start" });
        };
        applyHash();
        window.addEventListener("hashchange", applyHash);
        return () => window.removeEventListener("hashchange", applyHash);
    }, []);

    const select = (id: AssistantId, focus = false) => {
        setSelected(id);
        const tab = tabRefs.current[id];
        tab?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
        if (focus) tab?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        const ids = ASSISTANT_SETUPS.map((assistant) => assistant.id);
        const index = ids.indexOf(selected);
        const last = ids.length - 1;
        const targets: Record<string, number> = {
            ArrowRight: index === last ? 0 : index + 1,
            ArrowLeft: index === 0 ? last : index - 1,
            Home: 0,
            End: last,
        };
        const target = targets[event.key];
        if (target === undefined) return;
        event.preventDefault();
        select(ids[target], true);
    };

    return (
        <div className="flex flex-col gap-6">
            <div
                ref={tabsRef}
                role="tablist"
                aria-label={t("aiAgentsPage.connect.tabsLabel")}
                className="-mx-(--page-gutter) flex scroll-mt-24 gap-2 overflow-x-auto px-(--page-gutter) [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
            >
                {ASSISTANT_SETUPS.map((assistant) => {
                    const isSelected = assistant.id === selected;
                    const isSoon = assistant.steps.length === 0;
                    return (
                        <button
                            key={assistant.id}
                            ref={(element) => {
                                tabRefs.current[assistant.id] = element;
                            }}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${assistant.id}`}
                            aria-selected={isSelected}
                            aria-controls={assistantPanelAnchor(assistant.id)}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => select(assistant.id)}
                            onKeyDown={onKeyDown}
                            className={cn(
                                "relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-pill px-[18px] text-sm font-medium whitespace-nowrap transition-shadow",
                                NAV_FOCUS_CLASS,
                                isSelected
                                    ? "bg-ink text-surface"
                                    : "text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:shadow-[inset_0_0_0_1px_var(--ink)]",
                            )}
                        >
                            <span>{assistant.name}</span>
                            {isSoon && (
                                <span
                                    className={cn(
                                        "font-mono text-tag font-normal tracking-[0.12em] uppercase",
                                        isSelected ? "text-surface-sunken" : "text-ink-muted",
                                    )}
                                >
                                    <span aria-hidden="true">
                                        {t("aiAgentsPage.connect.soon.tab")}
                                    </span>
                                    <span className="sr-only">
                                        {t("aiAgentsPage.connect.soon.tabLabel")}
                                    </span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {ASSISTANT_SETUPS.map((assistant) => {
                const isSoon = assistant.steps.length === 0;
                return (
                    <div
                        key={assistant.id}
                        role="tabpanel"
                        id={assistantPanelAnchor(assistant.id)}
                        aria-labelledby={`${baseId}-tab-${assistant.id}`}
                        hidden={assistant.id !== selected}
                        className="grid scroll-mt-24 items-start gap-7 rounded-card bg-surface-raised px-5 py-6 shadow-ring sm:p-[clamp(28px,3.2vw,44px)] min-[1080px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[1080px]:gap-[clamp(32px,5vw,72px)]"
                    >
                        <div className="flex flex-col gap-3">
                            <p className="font-mono text-label tracking-[0.14em] text-ink-muted uppercase">
                                {t(`aiAgentsPage.connect.assistants.${assistant.id}.kind`)}
                            </p>
                            <h3 className="font-serif text-[34px] leading-[1.08] font-normal tracking-[-0.01em]">
                                {assistant.name}
                            </h3>
                            <p className="text-body text-ink-secondary">
                                {t(`aiAgentsPage.connect.assistants.${assistant.id}.intro`)}
                            </p>
                            {!isSoon && (
                                <div className="mt-2 flex flex-col gap-2 rounded-lg px-4 py-3.5 shadow-field">
                                    <DevelopmentTag labelKey="aiAgentsPage.connect.appNote.status" />
                                    <p className="text-body-sm leading-[1.55] text-ink-secondary">
                                        {t(
                                            `aiAgentsPage.connect.assistants.${assistant.id}.appNote`,
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                        {isSoon ? (
                            <ComingSoon assistant={assistant} onSelect={(id) => select(id, true)} />
                        ) : (
                            <SetupSteps assistant={assistant} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
