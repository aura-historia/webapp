import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserAccount } from "@/hooks/account/useUserAccount";
import { useUpdateUserAccount } from "@/hooks/account/usePatchUserAccount";
import { getAccountEditSchema, type AccountEditFormData } from "@/utils/nameValidation";
import { PersonalDataFormSkeleton } from "@/components/account/PersonalDataFormSkeleton";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PersonalDataForm() {
    const { t } = useTranslation();
    const { data: userAccount, isLoading } = useUserAccount();
    const { mutate: updateAccount, isPending } = useUpdateUserAccount();

    const accountEditSchema = useMemo(() => getAccountEditSchema(t), [t]);

    const accountEditForm = useForm<AccountEditFormData>({
        resolver: zodResolver(accountEditSchema),
        values: {
            firstName: userAccount?.firstName ?? "",
            lastName: userAccount?.lastName ?? "",
            language: userAccount?.language,
            currency: userAccount?.currency,
            prohibitedContentConsent: userAccount?.prohibitedContentConsent ?? false,
        },
    });

    const onSubmit = (data: AccountEditFormData) => {
        updateAccount(data, {
            onSuccess: () => {
                toast.success(t("account.personalData.successMessage"));
            },
        });
    };

    if (isLoading) {
        return <PersonalDataFormSkeleton />;
    }

    return (
        <Form {...accountEditForm}>
            <form onSubmit={accountEditForm.handleSubmit(onSubmit)} className="space-y-8">
                <FormItem>
                    <FormLabel>{t("account.personalData.emailLabel")}</FormLabel>
                    <FormControl>
                        <Input
                            value={userAccount?.email ?? ""}
                            readOnly
                            className="h-12 bg-muted/30 text-muted-foreground"
                        />
                    </FormControl>
                </FormItem>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                    <FormField
                        control={accountEditForm.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("account.personalData.firstNameLabel")}</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-12 bg-transparent" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={accountEditForm.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("account.personalData.lastNameLabel")}</FormLabel>
                                <FormControl>
                                    <Input {...field} className="h-12 bg-transparent" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                    <FormField
                        control={accountEditForm.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("account.personalData.languageLabel")}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    key={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full data-[size=default]:h-12">
                                            <SelectValue
                                                placeholder={t(
                                                    "account.personalData.languagePlaceholder",
                                                )}
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {LANGUAGES.map((lang) => (
                                            <SelectItem key={lang} value={lang}>
                                                {t(`auth.languages.${lang}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={accountEditForm.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("account.personalData.currencyLabel")}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    key={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full data-[size=default]:h-12">
                                            <SelectValue
                                                placeholder={t(
                                                    "account.personalData.currencyPlaceholder",
                                                )}
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {CURRENCIES.map((curr) => (
                                            <SelectItem key={curr} value={curr}>
                                                {t(`auth.currencies.${curr}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={accountEditForm.control}
                    name="prohibitedContentConsent"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-start gap-3">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-1"
                                    />
                                </FormControl>
                                <div className="space-y-1">
                                    <FormLabel className="inline-flex items-center gap-1.5 font-medium">
                                        {t("account.personalData.prohibitedContentConsentLabel")}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info
                                                        size={16}
                                                        className="text-muted-foreground cursor-help"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>
                                                        {t(
                                                            "account.personalData.prohibitedContentConsentTooltip",
                                                        )}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </FormLabel>
                                    <p className="text-muted-foreground text-xs">
                                        {t("account.personalData.prohibitedContentConsentTooltip")}
                                    </p>
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Spinner />}
                    {t("account.personalData.saveButton")}
                </Button>
            </form>
        </Form>
    );
}
