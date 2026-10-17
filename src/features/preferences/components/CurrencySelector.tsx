import { CURRENCIES, CURRENCY_SYMBOLS, type Currency } from "@/data/internal/common/Currency.ts";
import { useMemo } from "react";
import { useCurrencyPreference } from "@/features/preferences/hooks/useCurrencyPreference.ts";
import { useTranslation } from "react-i18next";
import { SearchableCurrencySelect } from "@/components/common/SearchableCurrencySelect.tsx";

export function CurrencySelector() {
    const { currency, setCurrency } = useCurrencyPreference();
    const { t, i18n } = useTranslation();

    const displayNames = useMemo(
        () => new Intl.DisplayNames([i18n.language], { type: "currency" }),
        [i18n.language],
    );
    const currencyOptions = useMemo(
        () =>
            CURRENCIES.map((code) => ({
                value: code,
                label: displayNames.of(code) ?? code,
                searchTerms: [CURRENCY_SYMBOLS[code]],
            })),
        [displayNames],
    );

    return (
        <SearchableCurrencySelect
            options={currencyOptions}
            value={currency}
            onValueChange={setCurrency}
            placeholder={t("auth.signUp.currency")}
            searchPlaceholder={t("common.currencySearchPlaceholder")}
            emptyMessage={t("common.currencySearchEmpty")}
            align="end"
            ariaLabel={t("auth.signUp.currency")}
            className="h-8 border-outline-variant/20 bg-transparent text-primary/80 transition-colors duration-300 ease-out hover:text-primary"
            renderValue={(option) =>
                option && (
                    <>
                        <span>{CURRENCY_SYMBOLS[option.value as Currency]}</span>
                        <span className="pl-2">{option.label}</span>
                    </>
                )
            }
            renderOption={(option) => (
                <>
                    <span className="inline-block w-8 shrink-0">
                        {CURRENCY_SYMBOLS[option.value as Currency]}
                    </span>
                    <span>{option.label}</span>
                </>
            )}
        />
    );
}
