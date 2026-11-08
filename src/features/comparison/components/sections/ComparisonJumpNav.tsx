import { useTranslation } from "react-i18next";

import {
    type ComparisonDefinition,
    getComparisonNav,
} from "@/features/comparison/config/comparisonDefinition.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { cn } from "@/lib/utils.ts";

/**
 * "On this page": crawlable anchors, one per chapter h2, derived from the definition. Phones get a
 * ruled list with the chapter numerals on the raised band; from 640px it is a single row that
 * sticks under the nav bar.
 */
export function ComparisonJumpNav({ definition }: { readonly definition: ComparisonDefinition }) {
    const { t } = useTranslation();
    const label = t("comparison.nav.label");

    return (
        <nav
            aria-label={label}
            className="border-b border-line-subtle bg-surface-raised px-5 py-7 text-ink sm:sticky sm:top-16 sm:z-40 sm:border-b-0 sm:bg-surface sm:px-(--page-gutter) sm:py-0 sm:shadow-[inset_0_-1px_0_var(--line)]"
        >
            <div className="mx-auto flex w-full max-w-content flex-col gap-3 sm:flex-row sm:items-center sm:gap-7 sm:overflow-x-auto sm:whitespace-nowrap sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden">
                <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-kicker text-brass-ink uppercase"
                >
                    {label}
                </span>
                <ol className="flex flex-col border-t border-line sm:flex-row sm:gap-6 sm:border-t-0">
                    {getComparisonNav(definition).map((item) => (
                        <li
                            key={item.id}
                            className="border-b border-line sm:shrink-0 sm:border-b-0"
                        >
                            <a
                                href={`#${item.id}`}
                                className={cn(
                                    "flex min-h-11 items-center justify-between gap-4 text-[15px] transition-colors hover:text-ink sm:min-h-[52px] sm:text-body-sm sm:text-ink-secondary sm:hover:shadow-[inset_0_-1px_0_var(--ink)]",
                                    NAV_FOCUS_CLASS,
                                )}
                            >
                                {t(item.labelKey)}
                                <span
                                    aria-hidden="true"
                                    className="font-mono text-[11px] text-ink-muted sm:hidden"
                                >
                                    {item.marker}
                                </span>
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
}
