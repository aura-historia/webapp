import { CircleAlert, Check, MapPin, Search } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import type { AddressSuggestion } from "@/data/internal/geography/AddressSuggestion.ts";
import { AMAZON_LOCATION_ATTRIBUTION } from "@/data/internal/geography/GeographyAttribution.ts";
import { useAddressSuggestions } from "@/features/account-management/hooks/useAddressSuggestions.ts";
import {
    FIELD_CLASS,
    FIELD_MESSAGE_CLASS,
    LABEL_CLASS,
} from "@/features/account-management/lib/accountStyles.ts";
import { cn } from "@/lib/utils.ts";

/** The suggestion the user picked; it stays valid only while the text still equals its label. */
export type AddressPick = Pick<AddressSuggestion, "placeId" | "kind" | "label">;

interface AddressSearchFieldProps {
    readonly id: string;
    readonly label: string;
    /** What the field shows; may differ from the stored text until the user types. */
    readonly value: string;
    /** Only text the user typed is searched, never a prefilled address. */
    readonly searchable: boolean;
    readonly pick?: AddressPick;
    readonly disabled: boolean;
    readonly error?: string;
    readonly onType: (value: string) => void;
    readonly onPick: (suggestion: AddressSuggestion) => void;
    readonly onSearchAgain: () => void;
}

const LINK_CLASS =
    "underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass";

/**
 * Search-as-you-type address field (board "Account · Address editor — add & edit dialog"): a
 * combobox with up to five suggestions and their attribution. Picking a complete address stops
 * the requests; typing again drops the pick. When suggestions are limited or unavailable the
 * field stays an ordinary text field.
 */
export function AddressSearchField({
    id,
    label,
    value,
    searchable,
    pick,
    disabled,
    error,
    onType,
    onPick,
    onSearchAgain,
}: AddressSearchFieldProps) {
    const { t } = useTranslation();
    const listboxId = useId();
    const optionId = useId();
    const messageId = `${id}-message`;
    const pickCurrent = pick !== undefined && pick.label === value;
    const completePick = pickCurrent && pick.kind === "ADDRESS";
    const suggestions = useAddressSuggestions(value, searchable && !completePick && !disabled);
    const [focused, setFocused] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [highlighted, setHighlighted] = useState(0);

    const items =
        suggestions.status === "ready" || suggestions.status === "loading"
            ? suggestions.suggestions
            : [];
    const attribution =
        (suggestions.status === "ready" || suggestions.status === "loading"
            ? suggestions.attribution
            : undefined) ?? AMAZON_LOCATION_ATTRIBUTION;
    const open = focused && !dismissed && !pickCurrent && items.length > 0;

    // A shorter list than the last one never points past its end.
    const active = highlighted < items.length ? highlighted : 0;

    const pickSuggestion = (suggestion: AddressSuggestion) => {
        onPick(suggestion);
        setDismissed(true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            if (!items.length) return;
            event.preventDefault();
            setDismissed(false);
            const step = event.key === "ArrowDown" ? 1 : -1;
            setHighlighted((active + step + items.length) % items.length);
        } else if (event.key === "Enter" && open && items[active]) {
            // Picks the suggestion instead of submitting the form.
            event.preventDefault();
            pickSuggestion(items[active]);
        } else if (event.key === "Escape" && open) {
            // Closes the list without closing the dialog.
            event.preventDefault();
            event.stopPropagation();
            setDismissed(true);
        }
    };

    let hint: { text: string; tone: "muted" | "secondary" } | undefined;
    if (pickCurrent && !completePick) {
        hint = { text: t("account.addresses.search.partialPick"), tone: "secondary" };
    } else if (suggestions.status === "limited") {
        hint = { text: t("account.addresses.search.limited"), tone: "secondary" };
    } else if (suggestions.status === "unavailable") {
        hint = { text: t("account.addresses.search.unavailable"), tone: "secondary" };
    } else if (suggestions.status === "ready" && items.length === 0) {
        hint = { text: t("account.addresses.search.empty"), tone: "muted" };
    } else if (!completePick) {
        hint = {
            text: searchable
                ? t("account.addresses.search.hintTyping")
                : t("account.addresses.search.hint"),
            tone: "muted",
        };
    }

    const typedLength = value.length;

    return (
        <div className="relative flex min-w-0 flex-col gap-2">
            <label htmlFor={id} data-error={Boolean(error)} className={LABEL_CLASS}>
                {label}
            </label>
            <div className="relative">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 left-3.5 size-4 text-ink-muted"
                    strokeWidth={1.8}
                />
                <input
                    id={id}
                    type="text"
                    role="combobox"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls={listboxId}
                    aria-activedescendant={open ? `${optionId}-${active}` : undefined}
                    aria-invalid={Boolean(error)}
                    aria-describedby={messageId}
                    value={value}
                    disabled={disabled}
                    placeholder={t("account.addresses.search.placeholder")}
                    onChange={(event) => {
                        setDismissed(false);
                        setHighlighted(0);
                        onType(event.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        FIELD_CLASS,
                        "pr-11 pl-10",
                        open && "shadow-[inset_0_0_0_1.5px_var(--ink)]",
                    )}
                />
                {suggestions.status === "loading" && (
                    <Spinner className="absolute top-4 right-3.5 size-4 text-ink-muted" />
                )}
            </div>

            {open && (
                <div className="absolute inset-x-0 top-[78px] z-50 flex flex-col gap-1 rounded-panel bg-surface-raised p-2 shadow-menu">
                    <div
                        id={listboxId}
                        role="listbox"
                        aria-label={t("account.addresses.search.listLabel")}
                        className="flex flex-col"
                    >
                        {items.map((suggestion, index) => {
                            const prefix =
                                suggestion.label.slice(0, typedLength).toLocaleLowerCase() ===
                                value.toLocaleLowerCase()
                                    ? suggestion.label.slice(0, typedLength)
                                    : "";
                            return (
                                // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection runs on the combobox via aria-activedescendant.
                                <div
                                    key={suggestion.placeId}
                                    id={`${optionId}-${index}`}
                                    role="option"
                                    tabIndex={-1}
                                    aria-selected={index === active}
                                    // Keeps focus in the field so the click lands before blur.
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => pickSuggestion(suggestion)}
                                    onMouseEnter={() => setHighlighted(index)}
                                    className={cn(
                                        "flex min-h-12 cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm leading-snug",
                                        index === active && "bg-surface-sunken",
                                    )}
                                >
                                    <MapPin
                                        aria-hidden="true"
                                        className="size-4 shrink-0 text-ink-muted"
                                        strokeWidth={1.6}
                                    />
                                    <span className="min-w-0 flex-1 wrap-anywhere">
                                        {prefix && (
                                            <strong className="font-semibold">{prefix}</strong>
                                        )}
                                        {suggestion.label.slice(prefix.length)}
                                    </span>
                                    {suggestion.kind !== "ADDRESS" && (
                                        <span className="inline-flex h-[22px] shrink-0 items-center rounded-sm bg-surface-sunken px-2 font-mono text-[10px] tracking-[0.1em] text-ink-secondary uppercase">
                                            {t(`account.addresses.search.kinds.${suggestion.kind}`)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="border-t border-line-subtle px-2.5 pt-2 pb-1 text-xs text-ink-muted">
                        <Trans
                            i18nKey="account.addresses.search.attribution"
                            values={{ provider: attribution.provider }}
                            components={{
                                providerLink: (
                                    // biome-ignore lint/a11y/useAnchorContent: Trans fills in the provider name.
                                    <a
                                        href={attribution.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onMouseDown={(event) => event.preventDefault()}
                                        className={LINK_CLASS}
                                    />
                                ),
                            }}
                        />
                    </p>
                </div>
            )}

            {error ? (
                <p
                    id={messageId}
                    role="alert"
                    className={cn(FIELD_MESSAGE_CLASS, "flex items-center gap-1.5")}
                >
                    <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
                    {error}
                </p>
            ) : completePick ? (
                <p
                    id={messageId}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-meta text-ink"
                >
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            aria-hidden="true"
                            className="inline-flex size-[18px] items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                        >
                            <Check className="size-[11px]" strokeWidth={3} />
                        </span>
                        {t("account.addresses.search.picked")}
                    </span>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            setDismissed(false);
                            onSearchAgain();
                            document.getElementById(id)?.focus();
                        }}
                        className={cn(
                            "min-h-8 cursor-pointer text-ink-secondary disabled:cursor-not-allowed",
                            LINK_CLASS,
                        )}
                    >
                        {t("account.addresses.search.searchAgain")}
                    </button>
                </p>
            ) : (
                hint && (
                    <p
                        id={messageId}
                        aria-live="polite"
                        className={cn(
                            "text-meta",
                            hint.tone === "muted" ? "text-ink-muted" : "text-ink-secondary",
                        )}
                    >
                        {hint.text}
                    </p>
                )
            )}
        </div>
    );
}
