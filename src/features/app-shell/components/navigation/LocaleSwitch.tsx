import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/data/internal/common/Currency.ts";
import { UNIT_SYSTEMS, type UnitSystem } from "@/data/internal/common/UnitSystem.ts";
import { useCurrencyPreference } from "@/features/preferences/hooks/useCurrencyPreference.ts";
import { useLanguageSwitch } from "@/features/preferences/hooks/useLanguageSwitch.ts";
import { useUnitSystemPreference } from "@/features/preferences/hooks/useUnitSystemPreference.ts";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages.ts";
import { cn } from "@/lib/utils.ts";
import { PreferencePicker } from "./PreferencePicker.tsx";

type LocaleSwitchVariant = "pill" | "plain" | "responsive";

const VARIANT_CLASSES: Record<LocaleSwitchVariant, { group: string; trigger: string }> = {
    pill: {
        group: "gap-2",
        trigger: "rounded-pill bg-surface-sunken px-3 data-[state=open]:bg-line-subtle",
    },
    plain: { group: "gap-x-4 gap-y-1", trigger: "rounded-xs" },
    responsive: {
        group: "gap-2 md:gap-x-4 md:gap-y-1",
        trigger:
            "rounded-pill bg-surface-sunken px-3 data-[state=open]:bg-line-subtle md:rounded-xs md:bg-transparent md:px-0 md:data-[state=open]:bg-transparent",
    },
};

const UNIT_DETAILS: Record<UnitSystem, string> = {
    METRIC: "cm · kg",
    IMPERIAL: "in · lb",
};

interface LocaleSwitchProps {
    /**
     * `pill`: filled pills (phone menu) · `plain`: bare mono labels ·
     * `responsive`: pills on phones, bare labels from 768px (footer).
     */
    readonly variant: LocaleSwitchVariant;
    readonly className?: string;
}

/** Language, currency and unit switches in mono; each opens its own picker. */
export function LocaleSwitch({ variant, className }: LocaleSwitchProps) {
    const { t } = useTranslation();
    const { language, switchLanguage } = useLanguageSwitch();
    const { currency, setCurrency } = useCurrencyPreference();
    const { unitSystem, setUnitSystem } = useUnitSystemPreference();
    const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === language);

    const currencyNames = useMemo(
        () => new Intl.DisplayNames([language], { type: "currency" }),
        [language],
    );

    const triggerClassName = cn(
        "inline-flex min-h-9 items-center font-mono text-[11px] tracking-[0.1em] text-ink-secondary uppercase transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass",
        VARIANT_CLASSES[variant].trigger,
    );

    return (
        <fieldset
            className={cn(
                "m-0 flex min-w-0 flex-wrap border-0 p-0",
                VARIANT_CLASSES[variant].group,
                className,
            )}
        >
            <legend className="sr-only">{t("header.preferences")}</legend>
            <PreferencePicker
                label={t("header.language")}
                displayValue={currentLanguage?.name ?? language}
                value={language}
                options={SUPPORTED_LANGUAGES.map((lang) => ({
                    value: lang.code,
                    label: lang.name,
                    detail: lang.code,
                }))}
                onChange={(value) => {
                    void switchLanguage(value);
                }}
                triggerClassName={triggerClassName}
            />
            <PreferencePicker
                label={t("header.currency")}
                displayValue={`${currency} ${CURRENCY_SYMBOLS[currency]}`}
                value={currency}
                options={CURRENCIES.map((code) => ({
                    value: code,
                    code,
                    label: currencyNames.of(code) ?? code,
                    detail: CURRENCY_SYMBOLS[code],
                }))}
                onChange={setCurrency}
                search={{
                    label: t("common.currencySearchPlaceholder"),
                    placeholder: t("common.currencySearchPlaceholder"),
                    emptyMessage: t("common.currencySearchEmpty"),
                }}
                triggerClassName={triggerClassName}
                className="w-[min(20rem,calc(100vw-2rem))]"
            />
            <PreferencePicker
                label={t("common.unitSystemPrefix")}
                displayValue={t(`auth.unitSystems.${unitSystem}`)}
                value={unitSystem}
                options={UNIT_SYSTEMS.map((option) => ({
                    value: option,
                    label: t(`auth.unitSystems.${option}`),
                    detail: UNIT_DETAILS[option],
                }))}
                onChange={setUnitSystem}
                triggerClassName={triggerClassName}
            />
        </fieldset>
    );
}
