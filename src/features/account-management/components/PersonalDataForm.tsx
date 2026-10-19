import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Lock } from "lucide-react";
import { type ReactNode, useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/data/internal/common/Currency.ts";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { UNIT_SYSTEMS, type UnitSystem } from "@/data/internal/common/UnitSystem.ts";
import { PersonalDataFormSkeleton } from "@/features/account-management/components/PersonalDataFormSkeleton.tsx";
import { useUpdateUserAccount } from "@/features/account-management/hooks/usePatchUserAccount.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import {
    CARD_CLASS,
    FIELD_CLASS,
    FIELD_MESSAGE_CLASS,
    FOCUS_CLASS,
    FORM_FOOTER_CLASS,
    GROUP_LABEL_CLASS,
    LABEL_CLASS,
    PRIMARY_BUTTON_CLASS,
} from "@/features/account-management/lib/accountStyles.ts";
import {
    type AccountEditFormData,
    getAccountEditSchema,
} from "@/features/account-management/lib/validation.ts";
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
    "flex h-12 w-full min-w-0 items-center gap-2 rounded-md bg-surface pr-3 pl-3.5 text-left text-[15px] text-ink shadow-field data-[state=open]:shadow-[inset_0_0_0_1.5px_var(--ink)]",
    FOCUS_CLASS,
);

interface PreferenceFieldProps {
    readonly label: string;
    readonly placeholder: string;
    readonly value: string | undefined;
    readonly options: readonly PreferenceOption[];
    readonly onChange: (value: string) => void;
    readonly search?: { label: string; placeholder: string; emptyMessage: string };
    readonly menuClassName?: string;
}

/** A form field that opens the shared preference picker (language, currency, units). */
function PreferenceField({
    label,
    placeholder,
    value,
    options,
    onChange,
    search,
    menuClassName,
}: PreferenceFieldProps) {
    const selected = options.find((option) => option.value === value);
    const code = [selected?.code, selected?.detail].filter(Boolean).join(" ");

    return (
        <div className="flex min-w-0 flex-col gap-2">
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
                triggerClassName={PICKER_TRIGGER_CLASS}
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

function FieldGroup({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    const labelId = useId();
    return (
        <div role="group" aria-labelledby={labelId} className="flex flex-col gap-5">
            <span id={labelId} className={GROUP_LABEL_CLASS}>
                {label}
            </span>
            {children}
        </div>
    );
}

export function PersonalDataForm() {
    const { t, i18n } = useTranslation();
    const { data: userAccount, isLoading } = useUserAccount();
    const { mutate: updateAccount, isPending } = useUpdateUserAccount();
    const emailId = useId();
    const sensitiveLabelId = useId();
    const sensitiveDescriptionId = useId();

    const accountEditSchema = useMemo(() => getAccountEditSchema(t), [t]);

    const accountEditForm = useForm<AccountEditFormData>({
        resolver: zodResolver(accountEditSchema),
        values: {
            firstName: userAccount?.firstName ?? "",
            lastName: userAccount?.lastName ?? "",
            language: userAccount?.language ?? undefined,
            currency: userAccount?.currency ?? undefined,
            unitSystem: userAccount?.unitSystem ?? undefined,
            showUnassessedOrSensitiveContent:
                userAccount?.showUnassessedOrSensitiveContent ?? false,
        },
    });

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

    const onSubmit = (data: AccountEditFormData) => {
        const { showUnassessedOrSensitiveContent, ...profile } = data;
        updateAccount(
            {
                ...profile,
                ...(showUnassessedOrSensitiveContent !==
                    userAccount?.showUnassessedOrSensitiveContent && {
                    showUnassessedOrSensitiveContent,
                }),
            },
            {
                onSuccess: () => {
                    toast.success(t("account.personalData.successMessage"));
                },
            },
        );
    };

    if (isLoading) {
        return <PersonalDataFormSkeleton />;
    }

    return (
        <div className={CARD_CLASS}>
            <Form {...accountEditForm}>
                <form
                    onSubmit={accountEditForm.handleSubmit(onSubmit)}
                    aria-label={t("account.personalData.title")}
                    className="flex flex-col gap-7"
                >
                    <FieldGroup label={t("account.personalData.profileGroup")}>
                        <div className="flex flex-col gap-2">
                            <label htmlFor={emailId} className={LABEL_CLASS}>
                                {t("account.personalData.emailLabel")}
                            </label>
                            <div className="relative">
                                <input
                                    id={emailId}
                                    type="email"
                                    value={userAccount?.email ?? ""}
                                    readOnly
                                    className={cn(
                                        FIELD_CLASS,
                                        "bg-surface-sunken pr-11 text-ink-muted",
                                    )}
                                />
                                <Lock
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-1/2 right-4 size-[15px] -translate-y-1/2 text-ink-muted"
                                    strokeWidth={1.8}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <FormField
                                control={accountEditForm.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="gap-2">
                                        <FormLabel className={LABEL_CLASS}>
                                            {t("account.personalData.firstNameLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="text"
                                                autoComplete="given-name"
                                                className={FIELD_CLASS}
                                            />
                                        </FormControl>
                                        <FormMessage className={FIELD_MESSAGE_CLASS} />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={accountEditForm.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem className="gap-2">
                                        <FormLabel className={LABEL_CLASS}>
                                            {t("account.personalData.lastNameLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="text"
                                                autoComplete="family-name"
                                                className={FIELD_CLASS}
                                            />
                                        </FormControl>
                                        <FormMessage className={FIELD_MESSAGE_CLASS} />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FieldGroup>

                    <div aria-hidden="true" className="h-px bg-line-subtle" />

                    <FieldGroup label={t("account.personalData.preferencesGroup")}>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <FormField
                                control={accountEditForm.control}
                                name="language"
                                render={({ field }) => (
                                    <PreferenceField
                                        label={t("account.personalData.languageLabel")}
                                        placeholder={t("account.personalData.languagePlaceholder")}
                                        value={field.value}
                                        options={languageOptions}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <FormField
                                control={accountEditForm.control}
                                name="currency"
                                render={({ field }) => (
                                    <PreferenceField
                                        label={t("account.personalData.currencyLabel")}
                                        placeholder={t("account.personalData.currencyPlaceholder")}
                                        value={field.value}
                                        options={currencyOptions}
                                        onChange={field.onChange}
                                        search={{
                                            label: t("common.currencySearchPlaceholder"),
                                            placeholder: t("common.currencySearchPlaceholder"),
                                            emptyMessage: t("common.currencySearchEmpty"),
                                        }}
                                        menuClassName="w-[min(20rem,calc(100vw-2rem))]"
                                    />
                                )}
                            />
                            <FormField
                                control={accountEditForm.control}
                                name="unitSystem"
                                render={({ field }) => (
                                    <PreferenceField
                                        label={t("account.personalData.unitSystemLabel")}
                                        placeholder={t(
                                            "account.personalData.unitSystemPlaceholder",
                                        )}
                                        value={field.value}
                                        options={unitOptions}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <FormField
                            control={accountEditForm.control}
                            name="showUnassessedOrSensitiveContent"
                            render={({ field }) => (
                                <FormItem className="gap-0">
                                    <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-4 shadow-field has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass">
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(event) =>
                                                    field.onChange(event.target.checked)
                                                }
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                                aria-labelledby={sensitiveLabelId}
                                                aria-describedby={sensitiveDescriptionId}
                                                className="peer sr-only"
                                            />
                                        </FormControl>
                                        <span
                                            aria-hidden="true"
                                            className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] bg-surface-raised text-on-oxblood shadow-[inset_0_0_0_1.5px_var(--line-strong)] peer-checked:bg-oxblood peer-checked:shadow-none [&>svg]:invisible peer-checked:[&>svg]:visible"
                                        >
                                            <Check className="size-3" strokeWidth={3.2} />
                                        </span>
                                        <span className="flex min-w-0 flex-col gap-1.5">
                                            <span
                                                id={sensitiveLabelId}
                                                className="text-body-sm leading-[1.4] font-medium text-ink"
                                            >
                                                {t(
                                                    "account.personalData.showUnassessedOrSensitiveContentLabel",
                                                )}
                                            </span>
                                            <span
                                                id={sensitiveDescriptionId}
                                                className="text-meta leading-[1.55] text-ink-secondary"
                                            >
                                                {t(
                                                    "account.personalData.showUnassessedOrSensitiveContentTooltip",
                                                )}
                                            </span>
                                        </span>
                                    </label>
                                </FormItem>
                            )}
                        />
                    </FieldGroup>

                    <div className={FORM_FOOTER_CLASS}>
                        <button type="submit" disabled={isPending} className={PRIMARY_BUTTON_CLASS}>
                            {isPending && <Spinner aria-hidden="true" />}
                            {t("account.personalData.saveButton")}
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
