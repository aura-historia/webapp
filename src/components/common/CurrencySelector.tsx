import {
    CURRENCIES,
    type Currency,
    inferCurrencyFromLocale,
    parseCurrency,
} from "@/data/internal/common/Currency.ts";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import { useUpdateUserAccount } from "@/hooks/account/usePatchUserAccount.ts";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
    EUR: "€",
    GBP: "£",
    USD: "$",
    AUD: "AU$",
    CAD: "C$",
    NZD: "NZ$",
};

export function CurrencySelector() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { mutate: updateAccount } = useUpdateUserAccount();
    const { data: account } = useUserAccount();
    const { user } = useAuthenticator((context) => [context.user]);
    const { i18n } = useTranslation();

    // On login: backend currency overwrites local preference to stay in sync across devices
    useEffect(() => {
        if (account?.currency) {
            updatePreferences({ currency: account.currency });
        }
    }, [account?.currency, updatePreferences]);

    const currency = preferences.currency ?? inferCurrencyFromLocale(i18n.language);
    const displayNames = useMemo(
        () => new Intl.DisplayNames([i18n.language], { type: "currency" }),
        [i18n.language],
    );

    const handleChange = useCallback(
        (value: string) => {
            const newCurrency = parseCurrency(value);
            updatePreferences({ currency: newCurrency });
            if (user) {
                updateAccount({ currency: newCurrency });
            }
        },
        [user, updatePreferences, updateAccount],
    );

    return (
        <Select value={currency} onValueChange={handleChange}>
            <SelectTrigger className="h-8 text-xs">
                <SelectValue>
                    <span>{CURRENCY_SYMBOLS[currency]}</span>
                    <span className="pl-2">{displayNames.of(currency)}</span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
                {CURRENCIES.map((code) => (
                    <SelectItem key={code} value={code}>
                        <span>{CURRENCY_SYMBOLS[code]}</span>
                        <span className="pl-2">{displayNames.of(code)}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
