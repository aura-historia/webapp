import { ArrowRight, Search, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";
import { SHOP_FOCUS_CLASS } from "@/features/shop/profile/lib/shopStyles.ts";
import { cn } from "@/lib/utils.ts";

/** Pause after the last keystroke before a typed query runs. */
export const SHOP_SEARCH_DEBOUNCE_MS = 350;

type ShopListingSearchProps = {
    readonly providerName: string;
    /** The search that is running now; empty when the full list shows. */
    readonly query: string;
    /** Runs a search, or restores the full list with an empty string. */
    readonly onSearch: (query: string) => void;
    readonly resultsId: string;
};

/**
 * Search field for one provider's listings. Typing runs the search after a short pause once it has
 * three characters, Enter runs it at once, and emptying the field restores the full list. Fewer
 * than three characters never search; the hint shows only when Enter is pressed.
 */
export function ShopListingSearch({
    providerName,
    query,
    onSearch,
    resultsId,
}: ShopListingSearchProps) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(query);
    const [tooShort, setTooShort] = useState(false);
    const lastSent = useRef(query);

    // Follow URL changes made elsewhere (back/forward, "Show all listings").
    useEffect(() => {
        if (query !== lastSent.current) {
            lastSent.current = query;
            setValue(query);
            setTooShort(false);
        }
    }, [query]);

    const send = useCallback(
        (term: string) => {
            if (term === lastSent.current) return;
            lastSent.current = term;
            onSearch(term);
        },
        [onSearch],
    );

    useEffect(() => {
        const term = value.trim();
        if (term.length === 0) {
            send("");
            return;
        }
        if (term.length < MIN_SEARCH_QUERY_LENGTH) return;

        const timeoutId = window.setTimeout(() => send(term), SHOP_SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timeoutId);
    }, [value, send]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const term = value.trim();
        if (term.length > 0 && term.length < MIN_SEARCH_QUERY_LENGTH) {
            setTooShort(true);
            return;
        }
        send(term);
    };

    const handleClear = () => {
        setValue("");
        setTooShort(false);
        inputRef.current?.focus();
    };

    const label = t("shop.search.label", { provider: providerName });
    const errorId = `${resultsId}-error`;

    return (
        <form
            role="search"
            aria-label={label}
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 md:w-[400px]"
        >
            <label htmlFor={`${resultsId}-query`} className="sr-only">
                {label}
            </label>
            <div
                className={cn(
                    "flex h-12 items-center gap-1.5 rounded-pill bg-surface-raised pr-1 pl-4 md:gap-2",
                    tooShort
                        ? "shadow-[inset_0_0_0_1.5px_var(--oxblood)]"
                        : "shadow-field focus-within:shadow-[inset_0_0_0_1.5px_var(--ink)]",
                )}
            >
                <Search
                    aria-hidden="true"
                    className="size-4 shrink-0 text-ink-muted"
                    strokeWidth={1.8}
                />
                <input
                    ref={inputRef}
                    id={`${resultsId}-query`}
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    value={value}
                    onChange={(event) => {
                        setValue(event.target.value);
                        setTooShort(false);
                    }}
                    placeholder={t("shop.search.placeholder")}
                    aria-invalid={tooShort}
                    aria-describedby={tooShort ? errorId : undefined}
                    aria-controls={resultsId}
                    className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-placeholder md:text-sm [&::-webkit-search-cancel-button]:hidden"
                />
                {value.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label={t("shop.search.clear")}
                        className={cn(
                            "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink md:size-8",
                            SHOP_FOCUS_CLASS,
                        )}
                    >
                        <X aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    </button>
                )}
                <button
                    type="submit"
                    aria-label={t("shop.search.submit")}
                    className={cn(
                        "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-ink text-sm font-medium text-surface md:w-auto md:px-4",
                        SHOP_FOCUS_CLASS,
                    )}
                >
                    <ArrowRight aria-hidden="true" className="size-4 md:hidden" strokeWidth={1.8} />
                    <span aria-hidden="true" className="hidden md:inline">
                        {t("shop.search.submit")}
                    </span>
                </button>
            </div>
            {tooShort && (
                <p id={errorId} role="alert" className="pl-4 text-meta leading-normal text-oxblood">
                    {t("search.messages.minQueryLength")}
                </p>
            )}
        </form>
    );
}
