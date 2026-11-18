import { useLocation } from "@tanstack/react-router";
import { type RefObject, useEffect } from "react";

/**
 * Focuses the hero search input so its brass focus ring invites the visitor to start searching.
 *
 * - On arrival, only with a fine pointer (mouse or trackpad): on touch devices focusing would open
 *   the on-screen keyboard over the hero. Never steals focus the visitor already placed elsewhere.
 * - When the page is targeted at the search (`#hero-search`, used by "search the market" links),
 *   always, since the visitor asked to search.
 *
 * Runs only after hydration, so server-rendered markup stays deterministic.
 */
export function useHeroSearchFocus(
    inputRef: RefObject<HTMLInputElement | null>,
    targetHash: string,
): void {
    const hash = useLocation({ select: (location) => location.hash });
    const targeted = hash === targetHash;

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;

        if (!targeted) {
            const finePointer =
                typeof window.matchMedia === "function" &&
                window.matchMedia("(pointer: fine)").matches;
            const active = document.activeElement;
            const focusElsewhere = active !== null && active !== document.body;
            if (!finePointer || focusElsewhere) return;
        }

        input.focus({ preventScroll: true });
    }, [inputRef, targeted]);
}
