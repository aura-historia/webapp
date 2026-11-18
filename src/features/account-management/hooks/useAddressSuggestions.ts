import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { suggestAddresses } from "@/client";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import {
    type AddressSuggestion,
    isAddressSuggestionQuery,
    mapToAddressSuggestionList,
} from "@/data/internal/geography/AddressSuggestion.ts";
import type { GeographyAttribution } from "@/data/internal/geography/GeographyAttribution.ts";

/** Wait after the last keystroke before asking; the next keystroke is the retry. */
export const ADDRESS_SUGGESTION_DEBOUNCE_MS = 300;

export type AddressSuggestionsState =
    /** No request: the query is too short, or suggestions are switched off. */
    | { readonly status: "idle" }
    /** A request runs; earlier suggestions stay visible until it answers. */
    | {
          readonly status: "loading";
          readonly suggestions: readonly AddressSuggestion[];
          readonly attribution?: GeographyAttribution;
      }
    | {
          readonly status: "ready";
          readonly suggestions: readonly AddressSuggestion[];
          readonly attribution?: GeographyAttribution;
      }
    /** `429`: paused until the backend's `Retry-After`; the user keeps typing. */
    | { readonly status: "limited" }
    /** `503`, other failures or no response: the user types the address. */
    | { readonly status: "unavailable" };

function retryAfterMs(response: Response | undefined): number {
    const seconds = Number(response?.headers.get("Retry-After"));
    return Number.isFinite(seconds) && seconds >= 1 ? seconds * 1000 : 60_000;
}

/**
 * Search-as-you-type address suggestions. Suggestions are display-only: they live in component
 * state for as long as the field shows them and never enter the query cache, storage or logs.
 * Requests are debounced, a newer query cancels an older one, and `enabled: false` (for example
 * after a complete address was picked) stops them.
 */
export function useAddressSuggestions(query: string, enabled: boolean): AddressSuggestionsState {
    const { i18n } = useTranslation();
    const language = parseLanguage(i18n.language.split("-")[0]);
    const [state, setState] = useState<AddressSuggestionsState>({ status: "idle" });
    const pausedUntil = useRef(0);

    useEffect(() => {
        if (!enabled || !isAddressSuggestionQuery(query)) {
            setState({ status: "idle" });
            return;
        }
        if (Date.now() < pausedUntil.current) {
            setState({ status: "limited" });
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setState((current) =>
                current.status === "ready" || current.status === "loading"
                    ? { ...current, status: "loading" }
                    : { status: "loading", suggestions: [] },
            );
            try {
                const response = await suggestAddresses({
                    body: { query: query.trim(), language },
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (controller.signal.aborted) return;
                if (response.data) {
                    const list = mapToAddressSuggestionList(response.data);
                    setState({ status: "ready", ...list });
                } else if (response.response?.status === 429) {
                    pausedUntil.current = Date.now() + retryAfterMs(response.response);
                    setState({ status: "limited" });
                } else {
                    setState({ status: "unavailable" });
                }
            } catch {
                // An aborted request was superseded; anything else leaves typing as the fallback.
                if (!controller.signal.aborted) setState({ status: "unavailable" });
            }
        }, ADDRESS_SUGGESTION_DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, enabled, language]);

    return state;
}
