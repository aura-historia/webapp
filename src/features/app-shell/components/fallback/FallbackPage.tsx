import { Link } from "@tanstack/react-router";
import { SearchX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

export const FALLBACK_PRIMARY_BUTTON_CLASS = cn(
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-surface aria-disabled:cursor-progress aria-disabled:opacity-70",
    FOCUS_CLASS,
);

const SECONDARY_BUTTON_CLASS = cn(
    "inline-flex h-11 items-center justify-center rounded-pill px-5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
    FOCUS_CLASS,
);

export type FallbackKind = "notFound" | "error";

/** Round icon: a raised disc for a missing page, an oxblood disc for an error. */
function FallbackIcon({
    kind,
    large = false,
    className,
}: {
    readonly kind: FallbackKind;
    readonly large?: boolean;
    readonly className: string;
}) {
    const Icon = kind === "error" ? TriangleAlert : SearchX;

    return (
        <span
            aria-hidden="true"
            data-testid="fallback-icon"
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-pill",
                kind === "error"
                    ? "bg-oxblood text-on-oxblood"
                    : "bg-surface-raised text-ink-muted shadow-ring",
                className,
            )}
        >
            {large ? (
                <Icon className="size-16" strokeWidth={1.2} />
            ) : (
                <Icon className="size-[22px]" strokeWidth={1.7} />
            )}
        </span>
    );
}

/**
 * The page shown when a route is missing or fails: eyebrow, serif headline, lead and actions,
 * with a generic icon beside the text on wide screens and above it on narrow ones. The site
 * header and footer stay as on every other page.
 */
export function FallbackPage({
    kind,
    primaryAction,
}: {
    readonly kind: FallbackKind;
    readonly primaryAction: ReactNode;
}) {
    const { t } = useTranslation();

    return (
        <div className="mx-auto w-full max-w-[calc(var(--container-content)+2*var(--page-gutter))] px-(--page-gutter) pt-10 pb-24 lg:pt-30 lg:pb-40">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:border-b lg:border-line-subtle lg:pb-12">
                <div className="flex min-w-0 flex-col gap-4">
                    <FallbackIcon kind={kind} className="size-14 lg:hidden" />
                    <span className="font-mono text-label text-brass-ink uppercase">
                        {t(`fallback.${kind}.eyebrow`)}
                    </span>
                    <h1 className="font-serif text-display-section text-ink [&_em]:italic">
                        <Trans
                            i18nKey={`fallback.${kind}.headline`}
                            components={HEADLINE_COMPONENTS}
                        />
                    </h1>
                    <p className="max-w-[540px] text-body text-ink-secondary">
                        {t(`fallback.${kind}.description`)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                        {primaryAction}
                        <Link
                            to="/$lng"
                            params={true}
                            from="/$lng"
                            className={SECONDARY_BUTTON_CLASS}
                        >
                            {t("fallback.goHome")}
                        </Link>
                    </div>
                </div>
                <div className="hidden justify-center lg:flex">
                    <FallbackIcon kind={kind} large className="size-50" />
                </div>
            </div>
        </div>
    );
}
