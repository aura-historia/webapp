import { CURRENCIES, CURRENCY_SYMBOLS, parseCurrency } from "@/data/internal/common/Currency.ts";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
import { useUpdateUserAccount } from "@/hooks/account/usePatchUserAccount.ts";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import { useAuth } from "@/hooks/auth/useAuth.ts";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CurrencySelector() {
    const { preferences, updatePreferences } = useUserPreferences();
    const { mutate: updateAccount } = useUpdateUserAccount();
    const { data: account } = useUserAccount();
    const { user } = useAuth();
    const { i18n } = useTranslation();

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
        <Select value={preferences.currency} onValueChange={handleChange}>
            <SelectTrigger className="h-8 gap-2 border-outline-variant/20 bg-transparent text-sm text-primary/80 transition-colors duration-300 ease-out hover:text-primary">
                <SelectValue>
                    <span>{CURRENCY_SYMBOLS[preferences.currency]}</span>
                    <span className="pl-2">{displayNames.of(preferences.currency)}</span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent align="end" className="max-h-60 overflow-hidden rounded-md">
                {CURRENCIES.map((code) => (
                    <SelectItem key={code} value={code}>
                        <span className="inline-block w-8 shrink-0">{CURRENCY_SYMBOLS[code]}</span>
                        <span>{displayNames.of(code)}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
