import { Loader2, Search } from "lucide-react";
import { type FormEvent, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { env } from "@/env.ts";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { useAnimatedPlaceholder } from "@/features/search/common/hooks/useAnimatedPlaceholder.ts";
import { useGlobalSearchSubmit } from "@/features/search/common/hooks/useGlobalSearchSubmit.ts";
import { useSearchQueryContext } from "@/features/search/common/hooks/useSearchQueryContext.tsx";
import { MIN_SEARCH_QUERY_LENGTH } from "@/features/search/products/lib/filterDefaults.ts";
import { cn } from "@/lib/utils.ts";

const isSearchEnabled = env.VITE_FEATURE_SEARCH_ENABLED;

export const HERO_SEARCH_ID = "hero-search";

/**
 * The hero search form on the ink ground: a parchment panel with the brass ring and deep glow,
 * a real example query as placeholder and the oxblood submit.
 */
export function HeroSearch({ className }: { readonly className?: string }) {
    const { t } = useTranslation();
    const inputId = useId();
    const errorId = useId();
    const { setQuery } = useSearchQueryContext();
    const { isPending, submit } = useGlobalSearchSubmit();
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const examples = useMemo(() => {
        const list = t("search.bar.placeholderExamplesProducts", { returnObjects: true });
        return Array.isArray(list) ? list : [];
    }, [t]);
    const placeholder = useAnimatedPlaceholder({ examples, enabled: !value });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = value.trim();

        if (query.length < MIN_SEARCH_QUERY_LENGTH) {
            setError(t("search.validation.queryMinLength"));
            return;
        }

        setError(null);
        submit(query, "products");
    };

    return (
        <div className={cn("flex w-full flex-col gap-2.5", className)}>
            <form
                id={HERO_SEARCH_ID}
                role="search"
                data-theme="light"
                onSubmit={handleSubmit}
                noValidate
                className="flex w-full scroll-mt-28 items-center gap-1 rounded-panel bg-surface-raised p-1.5 shadow-search has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass sm:flex-wrap sm:gap-2 sm:p-2"
            >
                <label htmlFor={inputId} className="sr-only">
                    {t("landingPage.hero.searchLabel")}
                </label>
                <input
                    id={inputId}
                    type="search"
                    inputMode="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    disabled={!isSearchEnabled}
                    value={value}
                    placeholder={placeholder}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => {
                        setValue(event.target.value);
                        setQuery(event.target.value);
                        if (error) setError(null);
                    }}
                    className="h-13 min-w-0 flex-1 basis-60 border-0 bg-transparent px-3 text-[17px] text-ink outline-none placeholder:text-ink-placeholder disabled:opacity-35 sm:h-14 [&::-webkit-search-cancel-button]:hidden"
                />
                <button
                    type="submit"
                    disabled={!isSearchEnabled || isPending}
                    aria-label={t("landingPage.hero.searchSubmit")}
                    className={cn(
                        "inline-flex size-13 shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-[9px] bg-oxblood text-[15px] font-medium text-on-oxblood transition-opacity hover:opacity-90 disabled:opacity-35 sm:h-14 sm:w-auto sm:px-[26px]",
                        NAV_FOCUS_CLASS,
                    )}
                >
                    {isPending ? (
                        <Loader2 aria-hidden="true" className="size-[18px] animate-spin" />
                    ) : (
                        <Search
                            aria-hidden="true"
                            className="size-5 sm:size-[17px]"
                            strokeWidth={1.8}
                        />
                    )}
                    <span aria-hidden="true" className="hidden sm:inline">
                        {t("landingPage.hero.searchSubmit")}
                    </span>
                </button>
            </form>
            {error && (
                <p id={errorId} role="alert" className="text-left text-sm text-brass-light">
                    {error}
                </p>
            )}
        </div>
    );
}
