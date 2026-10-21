import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/data/internal/common/Currency.ts";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { UNIT_SYSTEMS, type UnitSystem } from "@/data/internal/common/UnitSystem.ts";
import { FOCUS_CLASS, LABEL_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import {
    type PreferenceOption,
    PreferencePicker,
} from "@/features/app-shell/components/navigation/PreferencePicker.tsx";
import { cn } from "@/lib/utils.ts";

const UNIT_DETAILS: Record<UnitSystem, string> = {
    METRIC: "cm · kg",
    IMPERIAL: "in · lb",
};

const PICKER_TRIGGER_CLASS = cn(
    "flex h-12 w-full min-w-0 items-center gap-2 rounded-md pr-3 pl-3.5 text-left text-[15px] text-ink shadow-field data-[state=open]:shadow-[inset_0_0_0_1.5px_var(--ink)]",
    FOCUS_CLASS,
);

/** Language, currency and unit options for the preference fields, in the current language. */
export function usePreferenceOptions() {
    const { t, i18n } = useTranslation();

    const languageOptions = useMemo<PreferenceOption[]>(
        () =>
            LANGUAGES.map((language) => ({
                value: language,
                label: t(`auth.languages.${language}`),
                detail: language,
            })),
        [t],
    );

    const currencyOptions = useMemo<PreferenceOption[]>(() => {
        const currencyNames = new Intl.DisplayNames([i18n.language], { type: "currency" });
        return CURRENCIES.map((currency) => ({
            value: currency,
            code: currency,
            label: currencyNames.of(currency) ?? currency,
            detail: CURRENCY_SYMBOLS[currency],
        }));
    }, [i18n.language]);

    const unitOptions = useMemo<PreferenceOption[]>(
        () =>
            UNIT_SYSTEMS.map((unitSystem) => ({
                value: unitSystem,
                label: t(`auth.unitSystems.${unitSystem}`),
                detail: UNIT_DETAILS[unitSystem],
            })),
        [t],
    );

    return { languageOptions, currencyOptions, unitOptions };
}

interface PreferenceFieldProps {
    readonly label: string;
    readonly placeholder: string;
    readonly value: string | undefined;
    readonly options: readonly PreferenceOption[];
    readonly onChange: (value: string) => void;
    readonly search?: { label: string; placeholder: string; emptyMessage: string };
    readonly menuClassName?: string;
    /** Trigger fill: `surface` inside a raised card (default), `surface-raised` on the page. */
    readonly ground?: "card" | "page";
    readonly className?: string;
}

/** A form field that opens the shared preference picker (language, currency, units). */
export function PreferenceField({
    label,
    placeholder,
    value,
    options,
    onChange,
    search,
    menuClassName,
    ground = "card",
    className,
}: PreferenceFieldProps) {
    const selected = options.find((option) => option.value === value);
    const code = [selected?.code, selected?.detail].filter(Boolean).join(" ");

    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <span aria-hidden="true" className={LABEL_CLASS}>
                {label}
            </span>
            <PreferencePicker
                label={label}
                displayValue={selected?.label ?? placeholder}
                value={value ?? ""}
                options={options}
                onChange={onChange}
                search={search}
                triggerClassName={cn(
                    PICKER_TRIGGER_CLASS,
                    ground === "card" ? "bg-surface" : "bg-surface-raised",
                )}
                className={menuClassName}
                triggerContent={
                    <>
                        <span
                            className={cn(
                                "min-w-0 flex-1 truncate",
                                !selected && "text-ink-placeholder",
                            )}
                        >
                            {selected?.label ?? placeholder}
                        </span>
                        {code && (
                            <span className="shrink-0 font-mono text-tag text-ink-muted uppercase">
                                {code}
                            </span>
                        )}
                        <ChevronDown
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-ink-muted"
                            strokeWidth={1.8}
                        />
                    </>
                }
            />
        </div>
    );
}
