import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TEXT_LINK_CLASS } from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";

export type GlanceTileState = "pending" | "error" | "ready";

/** One count on the overview's ink panel; each tile loads and fails on its own. */
export function GlanceTile({
    state,
    label,
    figure,
    unit,
    note,
    flagged = false,
    cta,
    to,
    createSearch = false,
    onRetry,
}: {
    readonly state: GlanceTileState;
    readonly label: string;
    readonly figure: string;
    readonly unit: string;
    readonly note: string;
    /** Marks the note with a brass ring, e.g. tokens about to expire. */
    readonly flagged?: boolean;
    readonly cta: string;
    readonly to:
        | "/$lng/partners/applications"
        | "/$lng/partners/listing-sources"
        | "/$lng/partners/access-tokens";
    /** Opens the page's create dialog. */
    readonly createSearch?: boolean;
    readonly onRetry: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div
            aria-busy={state === "pending"}
            className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 md:px-7 md:py-0 md:first:pl-0 md:last:pr-0"
        >
            <span className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase">
                {label}
            </span>
            {state === "pending" && (
                <>
                    <span className="h-12 w-[40%] animate-pulse rounded-sm bg-surface-sunken motion-reduce:animate-none" />
                    <span className="h-3 w-[85%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                    <span className="h-8" />
                </>
            )}
            {state === "error" && (
                <>
                    <p className="font-serif text-[44px] leading-none text-ink-muted sm:text-[56px]">
                        <span aria-hidden="true">—</span>
                    </p>
                    <p
                        role="alert"
                        className="flex min-h-5 items-center gap-2 text-meta text-ink-secondary"
                    >
                        <span
                            aria-hidden="true"
                            className="size-[9px] shrink-0 rounded-pill bg-oxblood"
                        />
                        {t("partnerDashboard.overview.unavailable")}
                    </p>
                    <button
                        type="button"
                        className={cn(TEXT_LINK_CLASS, "cursor-pointer self-start")}
                        onClick={onRetry}
                    >
                        {t("partnerDashboard.tryAgain")}
                    </button>
                </>
            )}
            {state === "ready" && (
                <>
                    <p className="flex items-baseline gap-3">
                        <span className="font-serif text-[44px] leading-none tracking-[-0.02em] tabular-nums sm:text-[56px]">
                            {figure}
                        </span>
                        <span className="text-[15px] text-ink-secondary">{unit}</span>
                    </p>
                    <p className="flex min-h-5 items-center gap-2 text-meta text-ink-secondary">
                        {flagged && (
                            <span
                                aria-hidden="true"
                                className="size-[9px] shrink-0 rounded-pill shadow-[inset_0_0_0_1.5px_var(--brass-light)]"
                            />
                        )}
                        {note}
                    </p>
                    <Link
                        to={to}
                        params={true}
                        from="/$lng"
                        search={createSearch ? { create: true } : {}}
                        className={cn(TEXT_LINK_CLASS, "self-start")}
                    >
                        {cta}
                        <ArrowRight aria-hidden="true" className="size-[13px]" strokeWidth={1.8} />
                    </Link>
                </>
            )}
        </div>
    );
}
