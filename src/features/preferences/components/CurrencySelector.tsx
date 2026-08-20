import {
    CURRENCIES,
    CURRENCY_SYMBOLS,
    parseCurrency,
    type Currency,
} from "@/data/internal/common/Currency.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { useUpdateUserAccount } from "@/features/account-management/hooks/usePatchUserAccount.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SearchableCurrencySelect } from "@/components/common/SearchableCurrencySelect.tsx";

export function CurrencySelector() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { mutate: updateAccount } = useUpdateUserAccount();
    const { data: account } = useUserAccount();
    const { isAuthenticated } = useResolvedAuth();
    const { t, i18n } = useTranslation();

    // On login: backend currency overwrites local preference to stay in sync across devices
    useEffect(() => {
        if (account?.currency) {
            updatePreferences({ currency: account.currency });
        }
    }, [account?.currency, updatePreferences]);

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

    const handleChange = useCallback(
        (value: string) => {
            const newCurrency = parseCurrency(value);
            updatePreferences({ currency: newCurrency });
            if (isAuthenticated) {
                updateAccount({ currency: newCurrency });
            }
        },
        [isAuthenticated, updatePreferences, updateAccount],
    );

    return (
        <SearchableCurrencySelect
            options={currencyOptions}
            value={preferences.currency}
            onValueChange={handleChange}
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
