import type { LucideIcon } from "lucide-react";
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Trans } from "react-i18next";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { ResultStatePanel } from "@/features/search/products/components/results/SearchResultPlaceholders.tsx";

/** An empty or error state in a hairline panel (board "Partner dashboard · States"). */
export function PartnerStatePanel({
    tone,
    icon: Icon = TriangleAlert,
    titleKey,
    description,
    children,
}: {
    readonly tone: "empty" | "error";
    readonly icon?: LucideIcon;
    readonly titleKey: string;
    readonly description: string;
    readonly children?: ReactNode;
}) {
    const isError = tone === "error";
    return (
        <div className="rounded-panel shadow-ring">
            <ResultStatePanel
                alert={isError}
                icon={
                    <span
                        aria-hidden="true"
                        className={
                            isError
                                ? "inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                                : "inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                        }
                    >
                        <Icon className="size-[22px]" strokeWidth={isError ? 1.8 : 1.7} />
                    </span>
                }
                title={<Trans i18nKey={titleKey} components={HEADLINE_COMPONENTS} />}
                description={description}
            >
                {children}
            </ResultStatePanel>
        </div>
    );
}

/** A mono-labelled list section heading with its count on the right. */
export function PartnerListHeading({
    id,
    title,
    count,
}: {
    readonly id: string;
    readonly title: string;
    readonly count: string;
}) {
    return (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 id={id} className="font-serif text-2xl leading-[1.12] font-normal sm:text-[30px]">
                {title}
            </h2>
            <span className="font-mono text-[11px] tracking-[0.14em] text-ink-muted uppercase">
                {count}
            </span>
        </div>
    );
}
