import { useCallback, useEffect, useState } from "react";

export type ConsentDecision = "approve" | "deny";

/**
 * Tracks the consent decision the user has sent, from the click until the browser leaves the page.
 * A decision is sent once: while one is pending, both actions stay disabled so a second click
 * cannot race the first. Coming back to the page from the back-forward cache resets it.
 */
export function useConsentDecision() {
    const [pendingDecision, setPendingDecision] = useState<ConsentDecision | null>(null);

    useEffect(() => {
        const resetWhenRestored = (event: PageTransitionEvent) => {
            if (event.persisted) {
                setPendingDecision(null);
            }
        };
        window.addEventListener("pageshow", resetWhenRestored);
        return () => window.removeEventListener("pageshow", resetWhenRestored);
    }, []);

    const startDecision = useCallback((decision: ConsentDecision) => {
        setPendingDecision(decision);
    }, []);

    return { pendingDecision, startDecision };
}
