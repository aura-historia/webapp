import { ArrowRight, Loader2, Search } from "lucide-react";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { env } from "@/env.ts";
import { useGlobalSearchSubmit } from "@/features/search/common/hooks/useGlobalSearchSubmit.ts";
import { useSearchQueryContext } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";
import { cn } from "@/lib/utils.ts";
import { NAV_FOCUS_CLASS } from "./navigationConfig.ts";

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

interface NavSearchFieldProps {
    /**
     * `compact`: the app-bar field with a ⌘K hint.
     * `menu`: the larger field at the top of the phone menu, with an oxblood submit.
     * `bar`: the compact field in the phone app bar, at 16px so iOS does not zoom.
     */
    readonly variant: "compact" | "menu" | "bar";
    readonly onSubmitted?: () => void;
    readonly className?: string;
}

function isApplePlatform(): boolean {
    return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
}

export function NavSearchField({ variant, onSubmitted, className }: NavSearchFieldProps) {
    const { t } = useTranslation();
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const { setQuery } = useSearchQueryContext();
    const { currentQuery, isOnShopSearch, isPending, submit } = useGlobalSearchSubmit();
    const [value, setValue] = useState(currentQuery);
    // Platform-specific hint is resolved after mount to keep server markup deterministic.
    const [shortcutHint, setShortcutHint] = useState<string | null>(null);

    useEffect(() => {
        setValue(currentQuery);
    }, [currentQuery]);

    useEffect(() => {
        setQuery(value);
    }, [value, setQuery]);

    useEffect(() => {
        if (variant !== "compact") {
            return;
        }

        setShortcutHint(isApplePlatform() ? "⌘K" : "Ctrl K");

        const handleKeyDown = (event: KeyboardEvent) => {
            const input = inputRef.current;
            if (
                !input ||
                event.key.toLowerCase() !== "k" ||
                !(event.metaKey || event.ctrlKey) ||
                input.offsetParent === null
            ) {
                return;
            }

            event.preventDefault();
            input.focus();
            input.select();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [variant]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = value.trim();

        if (query.length < MIN_SEARCH_QUERY_LENGTH) {
            toast.warning(t("search.validation.queryMinLength"), {
                position: "top-center",
                duration: 2000,
            });
            return;
        }

        submit(query, isOnShopSearch ? "shops" : "products");
        onSubmitted?.();
    };

    const isMenu = variant === "menu";

    return (
        <form
            role="search"
            onSubmit={handleSubmit}
            className={cn(
                "flex min-w-0 items-center bg-surface-raised text-ink",
                isMenu
                    ? "h-15 gap-2.5 rounded-panel py-1.5 pr-2.5 pl-4 shadow-[0_0_0_1px_rgba(184,147,90,0.45)]"
                    : "h-11 gap-2.5 rounded-field pr-2.5 pl-3.5 shadow-field",
                className,
            )}
        >
            <Search
                aria-hidden="true"
                className={cn("shrink-0 text-ink-muted", isMenu ? "size-[18px]" : "size-[15px]")}
                strokeWidth={isMenu ? 1.8 : 2}
            />
            <label htmlFor={inputId} className="sr-only">
                {t("header.searchLabel")}
            </label>
            <input
                ref={inputRef}
                id={inputId}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                disabled={!isSearchEnabled}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={isMenu ? t("header.searchLabel") : t("header.searchPlaceholder")}
                className={cn(
                    "h-10 min-w-0 flex-1 border-0 bg-transparent text-ink outline-none placeholder:text-ink-placeholder disabled:opacity-35 [&::-webkit-search-cancel-button]:hidden",
                    variant === "compact" ? "text-sm" : "text-base",
                )}
            />
            {isMenu ? (
                <button
                    type="submit"
                    aria-label={t("header.searchSubmit")}
                    disabled={!isSearchEnabled || isPending}
                    className={cn(
                        "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-oxblood text-on-oxblood disabled:opacity-35",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {isPending ? (
                        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
                    )}
                </button>
            ) : (
                <>
                    {isPending && (
                        <Loader2
                            aria-hidden="true"
                            className="size-4 shrink-0 animate-spin text-ink-muted"
                        />
                    )}
                    {shortcutHint && !isPending && (
                        <span
                            aria-hidden="true"
                            className="hidden shrink-0 rounded-sm border border-line px-1.5 py-px font-mono text-[10px] text-ink-muted md:inline"
                        >
                            {shortcutHint}
                        </span>
                    )}
                    <button type="submit" className="sr-only">
                        {t("header.searchSubmit")}
                    </button>
                </>
            )}
        </form>
    );
}
