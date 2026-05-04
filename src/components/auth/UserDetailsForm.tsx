import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { z } from "zod";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { mapToBackendCurrency } from "@/data/internal/common/Currency.ts";
import { mapToBackendLanguage, parseLanguage } from "@/data/internal/common/Language.ts";
import { getAccountEditSchema } from "@/utils/nameValidation";
import { useUpdateUserAccount } from "@/hooks/account/usePatchUserAccount";
import { useNewsletterSubscription } from "@/hooks/newsletter/useNewsletterSubscription.ts";
import { useUserPreferences } from "@/hooks/preferences/useUserPreferences.tsx";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type UserDetailsFormProps = {
    readonly email: string;
    readonly onSuccess: () => void;
};

function getUserDetailsSchema(t: ReturnType<typeof useTranslation>["t"]) {
    return getAccountEditSchema(t).extend({
        newsletterConsent: z.boolean(),
    });
}

type UserDetailsFormValues = z.infer<ReturnType<typeof getUserDetailsSchema>>;

export function UserDetailsForm({ email, onSuccess }: UserDetailsFormProps) {
    const { t, i18n } = useTranslation();
    const schema = getUserDetailsSchema(t);
    const { preferences } = useUserPreferences();

    const form = useForm<UserDetailsFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            language: undefined,
            currency: undefined,
            newsletterConsent: true,
            prohibitedContentConsent: false,
        },
    });

    const { mutateAsync: updateAccount, isPending } = useUpdateUserAccount();
    const { mutateAsync: subscribe, isPending: isNewsletterPending } = useNewsletterSubscription();

    const subscribeUserToNewsletter = async (data?: UserDetailsFormValues) => {
        if (!data?.newsletterConsent) {
            return;
        }

        await subscribe({
            email,
            firstName: data?.firstName || undefined,
            lastName: data?.lastName || undefined,
            language: mapToBackendLanguage(data?.language ?? parseLanguage(i18n.language)),
            currency: mapToBackendCurrency(data?.currency ?? preferences.currency),
        });
    };

    const onSubmit = async (data: UserDetailsFormValues) => {
        try {
            await updateAccount({
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                language: data.language || undefined,
                currency: data.currency || undefined,
                prohibitedContentConsent: data.prohibitedContentConsent,
            });
            await subscribeUserToNewsletter(data);
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : t("apiErrors.unknown");
            form.setError("root", { message });
        }
    };

    const handleSkip = async () => {
        try {
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : t("apiErrors.unknown");
            form.setError("root", { message });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl text-primary">
                    {t("auth.userDetails.title")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("auth.userDetails.subtitle")}</p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.firstName")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            autoComplete="given-name"
                                            placeholder={t("auth.signUp.firstNamePlaceholder")}
                                            className="h-11 bg-transparent"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.lastName")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            autoComplete="family-name"
                                            placeholder={t("auth.signUp.lastNamePlaceholder")}
                                            className="h-11 bg-transparent"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.language")}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        key={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full data-[size=default]:h-11">
                                                <SelectValue
                                                    placeholder={t("auth.signUp.pleaseSelect")}
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
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.currency")}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        key={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full data-[size=default]:h-11">
                                                <SelectValue
                                                    placeholder={t("auth.signUp.pleaseSelect")}
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
                        control={form.control}
                        name="newsletterConsent"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) =>
                                                field.onChange(checked === true)
                                            }
                                            className="mt-1 shrink-0"
                                        />
                                    </FormControl>
                                    <div className="flex-1">
                                        <FormLabel className="block cursor-pointer text-sm font-normal leading-relaxed">
                                            <Trans
                                                i18nKey="auth.userDetails.newsletterConsentText"
                                                components={{
                                                    privacyLink: (
                                                        <Link
                                                            to="/privacy"
                                                            className="underline underline-offset-2"
                                                        />
                                                    ),
                                                }}
                                            />
                                        </FormLabel>
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="prohibitedContentConsent"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="inline-flex cursor-pointer items-center gap-1.5 font-medium leading-snug">
                                        {t("auth.signUp.prohibitedContentConsentLabel")}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info
                                                        size={14}
                                                        className="shrink-0 cursor-help text-muted-foreground"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>
                                                        {t(
                                                            "auth.signUp.prohibitedContentConsentTooltip",
                                                        )}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.formState.errors.root && (
                        <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {form.formState.errors.root.message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting || isPending || isNewsletterPending}
                        className="mt-2 w-full"
                    >
                        {(form.formState.isSubmitting || isPending || isNewsletterPending) && (
                            <Spinner />
                        )}
                        {t("auth.userDetails.submit")}
                    </Button>

                    <Button
                        type="button"
                        variant="link"
                        onClick={handleSkip}
                        disabled={form.formState.isSubmitting || isPending || isNewsletterPending}
                        className="h-auto p-0 text-sm text-muted-foreground"
                    >
                        {t("auth.userDetails.skip")}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
