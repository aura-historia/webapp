import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { SearchUrlParams } from "@/features/search/products/lib/searchUrlParams.ts";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

const ACTIVE_TAB_CLASS = cn(
    "relative inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink",
    FOCUS_CLASS,
);
const INACTIVE_TAB_CLASS = cn(
    "inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-brass-ink",
    FOCUS_CLASS,
);

function ActiveMark() {
    return (
        <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-0.5 rounded-xs bg-oxblood"
        />
    );
}

type SearchTypeTabsProps = {
    readonly active: "objects" | "providers";
    /** The search query, carried to the other tab. */
    readonly query: string;
    /** The full object search parameters, so the Objects tab keeps its filters. */
    readonly objectSearch?: SearchUrlParams;
    /** Formatted object total, shown beside the Objects tab when known. */
    readonly objectCount?: string;
};

/** The Objects / Providers tab row above the search results, shared by both search pages. */
export function SearchTypeTabs({ active, query, objectSearch, objectCount }: SearchTypeTabsProps) {
    const { t } = useTranslation();
    const objectsActive = active === "objects";

    return (
        <nav
            aria-label={t("search.type.label")}
            className="mb-6 flex gap-6 shadow-[inset_0_-1px_0_var(--line-subtle)] sm:mb-9 sm:gap-7"
        >
            <Link
                to="/$lng/search"
                params={true}
                from="/$lng"
                search={objectSearch ?? { q: query }}
                aria-current={objectsActive ? "page" : undefined}
                className={objectsActive ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS}
            >
                {t("search.type.objects")}
                {objectsActive && objectCount && (
                    <span className="font-mono text-tag font-normal text-ink-muted">
                        {objectCount}
                    </span>
                )}
                {objectsActive && <ActiveMark />}
            </Link>
            <Link
                to="/$lng/search/shops"
                params={true}
                from="/$lng"
                search={{ q: query }}
                aria-current={objectsActive ? undefined : "page"}
                className={objectsActive ? INACTIVE_TAB_CLASS : ACTIVE_TAB_CLASS}
            >
                {t("search.type.providers")}
                {!objectsActive && <ActiveMark />}
            </Link>
        </nav>
    );
}
