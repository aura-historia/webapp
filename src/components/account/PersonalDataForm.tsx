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
import { useUserAccount } from "@/hooks/useUserAccount";
import { useUpdateUserAccount } from "@/hooks/usePatchUserAccount";
import { getAccountEditSchema, type AccountEditFormData } from "@/utils/nameValidation";
import { PersonalDataFormSkeleton } from "@/components/account/PersonalDataFormSkeleton";

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
            <form onSubmit={accountEditForm.handleSubmit(onSubmit)} className="space-y-4">
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

                <FormField
                    control={accountEditForm.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("account.personalData.languageLabel")}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full !h-12">
                                        <SelectValue
                                            placeholder={t(
                                                "account.personalData.languagePlaceholder",
                                            )}
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="de">{t("auth.languages.de")}</SelectItem>
                                    <SelectItem value="en">{t("auth.languages.en")}</SelectItem>
                                    <SelectItem value="fr">{t("auth.languages.fr")}</SelectItem>
                                    <SelectItem value="es">{t("auth.languages.es")}</SelectItem>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full !h-12">
                                        <SelectValue
                                            placeholder={t(
                                                "account.personalData.currencyPlaceholder",
                                            )}
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="EUR">{t("auth.currencies.EUR")}</SelectItem>
                                    <SelectItem value="GBP">{t("auth.currencies.GBP")}</SelectItem>
                                    <SelectItem value="USD">{t("auth.currencies.USD")}</SelectItem>
                                    <SelectItem value="AUD">{t("auth.currencies.AUD")}</SelectItem>
                                    <SelectItem value="CAD">{t("auth.currencies.CAD")}</SelectItem>
                                    <SelectItem value="NZD">{t("auth.currencies.NZD")}</SelectItem>
                                </SelectContent>
                            </Select>
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
