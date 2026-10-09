import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { confirmNewsletterSubscription } from "@/client";
import { USER_ACCOUNT_QUERY_KEY } from "@/features/account-management/api/accountQueryKeys.ts";
import { parseNewsletterConfirmationFragment } from "@/features/newsletter/lib/newsletterConfirmationToken.ts";

export type NewsletterConfirmationStatus =
    /** Server render and first client render, before the fragment is read. */
    | "reading"
    /** A well-formed token is held in memory and waits for an explicit action. */
    | "ready"
    | "submitting"
    /** Temporary failure; the same in-memory token may be retried deliberately. */
    | "failed"
    | "confirmed"
    /** No token, e.g. after a reload removed it from memory. */
    | "missing"
    /** Malformed link or a token the backend no longer accepts. */
    | "invalid";

type NewsletterConfirmation = {
    readonly status: NewsletterConfirmationStatus;
    readonly confirm: () => Promise<void>;
};

/**
 * Captures the confirmation capability from the URL fragment after hydration and confirms it only
 * when `confirm` is called. The token stays in this hook's memory: it is removed from the visible
 * URL and history entry, and never stored, logged, rendered or used as a query key.
 */
export function useNewsletterConfirmation(): NewsletterConfirmation {
    const queryClient = useQueryClient();
    const tokenRef = useRef<string | null>(null);
    const hasCapturedRef = useRef(false);
    const isSubmittingRef = useRef(false);
    const [status, setStatus] = useState<NewsletterConfirmationStatus>("reading");

    useEffect(() => {
        // Strict Mode re-runs effects; the fragment is already gone on the second run.
        if (hasCapturedRef.current) return;
        hasCapturedRef.current = true;

        const { hash, pathname, search } = window.location;
        const fragment = parseNewsletterConfirmationFragment(hash);
        if (hash !== "") {
            window.history.replaceState(window.history.state, "", `${pathname}${search}`);
        }

        if (fragment.kind === "token") {
            tokenRef.current = fragment.token;
            setStatus("ready");
        } else {
            setStatus(fragment.kind === "missing" ? "missing" : "invalid");
        }
    }, []);

    const confirm = useCallback(async () => {
        const token = tokenRef.current;
        if (token === null || isSubmittingRef.current) return;

        isSubmittingRef.current = true;
        setStatus("submitting");

        try {
            const { error, response } = await confirmNewsletterSubscription({
                body: { token },
                cache: "no-store",
            });

            if (!error && response?.ok) {
                tokenRef.current = null;
                setStatus("confirmed");
                // The backend owns consent state; refetch instead of setting a local flag.
                void queryClient.invalidateQueries({ queryKey: USER_ACCOUNT_QUERY_KEY });
                return;
            }

            if (response?.status === 400) {
                tokenRef.current = null;
                setStatus("invalid");
                return;
            }

            setStatus("failed");
        } catch {
            setStatus("failed");
        } finally {
            isSubmittingRef.current = false;
        }
    }, [queryClient]);

    return { status, confirm };
}
