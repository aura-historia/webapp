import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { cn } from "@/lib/utils.ts";

export type OnThisPageLink = {
    /** The fragment, without `#`. */
    readonly id: string;
    readonly label: string;
};

interface OnThisPageNavProps {
    /** "On this page"; names the navigation and leads the row from 640px. */
    readonly label: string;
    readonly links: readonly OnThisPageLink[];
}

/**
 * The "On this page" row that closes an ink hero: ruled text links from 640px, a row of pills that
 * scrolls sideways on phones.
 */
export function OnThisPageNav({ label, links }: OnThisPageNavProps) {
    return (
        <nav
            aria-label={label}
            className="mt-4 sm:mt-[clamp(24px,3vw,40px)] sm:flex sm:flex-wrap sm:items-center sm:gap-x-7 sm:border-t sm:border-line sm:pt-3"
        >
            <span
                aria-hidden="true"
                className="hidden font-mono text-kicker text-ink-muted uppercase sm:inline"
            >
                {label}
            </span>
            <ul className="-mx-(--page-gutter) flex gap-2 overflow-x-auto px-(--page-gutter) [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-x-7 sm:gap-y-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                {links.map((link) => (
                    <li key={link.id} className="shrink-0">
                        <a
                            href={`#${link.id}`}
                            className={cn(
                                "inline-flex h-11 items-center rounded-pill px-4 text-meta text-ink-secondary shadow-[inset_0_0_0_1px_var(--line-strong)] transition-colors hover:text-brass sm:h-auto sm:min-h-11 sm:rounded-none sm:px-0 sm:text-body-sm sm:shadow-none",
                                NAV_FOCUS_CLASS,
                            )}
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
