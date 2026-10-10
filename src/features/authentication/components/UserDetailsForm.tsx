import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { LANGUAGES, parseLanguage } from "@/data/internal/common/Language.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { UNIT_SYSTEMS } from "@/data/internal/common/UnitSystem.ts";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";
import { getAccountEditSchema } from "@/features/account-management/lib/validation.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { useRegistrationAccount } from "@/features/authentication/hooks/useRegistrationAccount.ts";
import { useRegistrationPreferences } from "@/features/authentication/hooks/useRegistrationPreferences.ts";
import { useFederatedIdentity } from "@/features/authentication/hooks/useFederatedIdentity.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import type { FederatedIdentity } from "@/features/authentication/lib/federatedIdentity.ts";
import { useNewsletterSubscription } from "@/features/newsletter/api/useNewsletterSubscription.ts";
import {
    Form,
    FormControl,
    FormDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchableCurrencySelect } from "@/components/common/SearchableCurrencySelect.tsx";

type UserDetailsFormProps = {
    readonly onSuccess: () => void;
};

function getUserDetailsSchema(t: ReturnType<typeof useTranslation>["t"]) {
    return getAccountEditSchema(t).extend({
        newsletterRequest: z.boolean(),
    });
}

type UserDetailsFormValues = z.infer<ReturnType<typeof getUserDetailsSchema>>;

export function UserDetailsForm({ onSuccess }: UserDetailsFormProps) {
    const { isResolved, isAuthenticated } = useResolvedAuth();
    const { data: account, isPending: isAccountPending } = useUserAccount();
    const federatedIdentity = useFederatedIdentity();

    // Wait for the stored profile so the form opens with it instead of replacing typed input.
    // A failed account read still opens the form with inferred defaults.
    if (!isResolved || (isAuthenticated && isAccountPending) || federatedIdentity === undefined) {
        return <UserDetailsFormSkeleton />;
    }

    return (
        <UserDetailsFormContent
            account={account}
            federatedIdentity={federatedIdentity}
            onSuccess={onSuccess}
        />
    );
}

type UserDetailsFormContentProps = UserDetailsFormProps & {
    readonly account?: UserAccountData;
    readonly federatedIdentity: FederatedIdentity | null;
};

function UserDetailsFormContent({
    account,
    federatedIdentity,
    onSuccess,
}: UserDetailsFormContentProps) {
    const { t, i18n } = useTranslation();
    const schema = getUserDetailsSchema(t);
    const { preferences } = useRegistrationPreferences();
    const inferredLanguage = parseLanguage(i18n.resolvedLanguage ?? i18n.language);
    // Native sign-up records the marketing choice before verification. Federated sign-up
    // has no such step, so it may request the standalone double opt-in here instead.
    const newsletterEmail = federatedIdentity?.email;

    const form = useForm<UserDetailsFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: account?.firstName || federatedIdentity?.firstName || "",
            lastName: account?.lastName || federatedIdentity?.lastName || "",
            language: account?.language ?? inferredLanguage,
            currency: account?.currency ?? preferences.currency,
            unitSystem: account?.unitSystem ?? preferences.unitSystem,
            showUnassessedOrSensitiveContent: account?.showUnassessedOrSensitiveContent ?? false,
            newsletterRequest: false,
        },
    });

    const { mutateAsync: updateAccount, isPending } = useRegistrationAccount();
    const { mutateAsync: requestNewsletter, isPending: isNewsletterPending } =
        useNewsletterSubscription();
    const isBusy = form.formState.isSubmitting || isPending || isNewsletterPending;

    const onSubmit = async (data: UserDetailsFormValues) => {
        try {
            await updateAccount({
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                language: data.language || undefined,
                currency: data.currency || undefined,
                unitSystem: data.unitSystem || undefined,
                showUnassessedOrSensitiveContent: data.showUnassessedOrSensitiveContent,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : t("apiErrors.unknown");
            form.setError("root", { message });
            return;
        }

        if (data.newsletterRequest && newsletterEmail) {
            try {
                await requestNewsletter({
                    email: newsletterEmail,
                    firstName: data.firstName || undefined,
                    lastName: data.lastName || undefined,
                    language: data.language,
                    currency: data.currency,
                });
            } catch {
                // The profile is saved; retrying repeats that idempotent update.
                form.setError("root", { message: t("auth.userDetails.newsletter.requestFailed") });
                return;
            }

            // A 204 only means the request was handled; never claim a subscription or delivery.
            toast.success(t("auth.userDetails.newsletter.requestedTitle"), {
                description: t("auth.userDetails.newsletter.requestedDescription", {
                    email: newsletterEmail,
                }),
                duration: 10_000,
            });
        }

        onSuccess();
    };

    const handleSkip = () => {
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
                                        value={field.value ?? ""}
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
                                    <SearchableCurrencySelect
                                        options={CURRENCIES.map((currency) => ({
                                            value: currency,
                                            label: t(`auth.currencies.${currency}`),
                                        }))}
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                        placeholder={t("auth.signUp.pleaseSelect")}
                                        searchPlaceholder={t("common.currencySearchPlaceholder")}
                                        emptyMessage={t("common.currencySearchEmpty")}
                                        className="h-11"
                                        ariaLabel={t("auth.signUp.currency")}
                                        formControl
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="unitSystem"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("auth.signUp.unitSystem")}</FormLabel>
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
                                        {UNIT_SYSTEMS.map((unitSystem) => (
                                            <SelectItem key={unitSystem} value={unitSystem}>
                                                {t(`auth.unitSystems.${unitSystem}`)}
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
                        name="showUnassessedOrSensitiveContent"
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
                                        {t("auth.signUp.showUnassessedOrSensitiveContentLabel")}
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
                                                            "auth.signUp.showUnassessedOrSensitiveContentTooltip",
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

                    {newsletterEmail && (
                        <FormField
                            control={form.control}
                            name="newsletterRequest"
                            render={({ field }) => (
                                <FormItem className="flex items-start gap-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) =>
                                                field.onChange(checked === true)
                                            }
                                            className="mt-0.5 shrink-0"
                                        />
                                    </FormControl>
                                    <div className="flex flex-1 flex-col gap-1">
                                        <FormLabel className="block cursor-pointer text-sm font-normal leading-relaxed">
                                            {t("newsletter.purpose")}
                                        </FormLabel>
                                        <FormDescription className="text-xs leading-relaxed">
                                            <Trans
                                                i18nKey="auth.userDetails.newsletter.doubleOptIn"
                                                values={{ email: newsletterEmail }}
                                                components={{
                                                    privacyLink: (
                                                        <Link
                                                            to="/$lng/privacy"
                                                            className="underline underline-offset-2"
                                                            params={true}
                                                            from="/$lng"
                                                        />
                                                    ),
                                                }}
                                            />
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}

                    {form.formState.errors.root && (
                        <p
                            role="alert"
                            className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        >
                            {form.formState.errors.root.message}
                        </p>
                    )}

                    <Button type="submit" disabled={isBusy} className="mt-2 w-full">
                        {isBusy && <Spinner />}
                        {t("auth.userDetails.submit")}
                    </Button>

                    <Button
                        type="button"
                        variant="link"
                        onClick={handleSkip}
                        disabled={isBusy}
                        className="h-auto p-0 text-sm text-muted-foreground"
                    >
                        {t("auth.userDetails.skip")}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

function UserDetailsFormSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-[4.25rem] w-full" />
                    <Skeleton className="h-[4.25rem] w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-[4.25rem] w-full" />
                    <Skeleton className="h-[4.25rem] w-full" />
                </div>
                <Skeleton className="h-[4.25rem] w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-9 w-full" />
            </div>
        </div>
    );
}
