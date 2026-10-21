import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useId } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import type { UserAccountData } from "@/data/internal/account/UserAccountData.ts";
import { getAccountEditSchema } from "@/features/account-management/lib/validation.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import {
    PreferenceField,
    usePreferenceOptions,
} from "@/features/account-management/components/PreferenceField.tsx";
import { useRegistrationAccount } from "@/features/authentication/hooks/useRegistrationAccount.ts";
import { useRegistrationPreferences } from "@/features/authentication/hooks/useRegistrationPreferences.ts";
import { useFederatedIdentity } from "@/features/authentication/hooks/useFederatedIdentity.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import type { FederatedIdentity } from "@/features/authentication/lib/federatedIdentity.ts";
import { AuthFormAlert } from "@/features/authentication/components/AuthFormAlert.tsx";
import { AuthFormHeader } from "@/features/authentication/components/AuthFormHeader.tsx";
import { CheckboxPanel } from "@/features/authentication/components/CheckboxPanel.tsx";
import { RegistrationSteps } from "@/features/authentication/components/RegistrationSteps.tsx";
import {
    AUTH_FIELD_CLASS,
    AUTH_FIELD_MESSAGE_CLASS,
    AUTH_GHOST_BUTTON_CLASS,
    AUTH_LABEL_CLASS,
    AUTH_LINK_CLASS,
    AUTH_PRIMARY_BUTTON_CLASS,
} from "@/features/authentication/lib/authStyles.ts";
import { useNewsletterSubscription } from "@/features/newsletter/api/useNewsletterSubscription.ts";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils.ts";

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
    const { languageOptions, currencyOptions, unitOptions } = usePreferenceOptions();

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
        <div className="flex flex-col gap-7">
            <RegistrationSteps current={3} />

            <AuthFormHeader
                eyebrow={t("auth.userDetails.eyebrow")}
                titleKey="auth.userDetails.title"
                lead={t("auth.userDetails.subtitle")}
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-6"
                    noValidate
                >
                    <FieldGroup label={t("auth.userDetails.nameGroup")}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="gap-2">
                                        <FormLabel className={AUTH_LABEL_CLASS}>
                                            {t("auth.signUp.firstName")}
                                        </FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="text"
                                                autoComplete="given-name"
                                                placeholder={t("auth.signUp.firstNamePlaceholder")}
                                                disabled={isBusy}
                                                className={AUTH_FIELD_CLASS}
                                            />
                                        </FormControl>
                                        <FormMessage className={AUTH_FIELD_MESSAGE_CLASS} />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem className="gap-2">
                                        <FormLabel className={AUTH_LABEL_CLASS}>
                                            {t("auth.signUp.lastName")}
                                        </FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                type="text"
                                                autoComplete="family-name"
                                                placeholder={t("auth.signUp.lastNamePlaceholder")}
                                                disabled={isBusy}
                                                className={AUTH_FIELD_CLASS}
                                            />
                                        </FormControl>
                                        <FormMessage className={AUTH_FIELD_MESSAGE_CLASS} />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FieldGroup>

                    <div aria-hidden="true" className="h-px bg-line-subtle" />

                    <FieldGroup label={t("auth.userDetails.preferencesGroup")}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <PreferenceField
                                        label={t("auth.signUp.currency")}
                                        placeholder={t("auth.signUp.pleaseSelect")}
                                        value={field.value}
                                        options={currencyOptions}
                                        onChange={field.onChange}
                                        search={{
                                            label: t("common.currencySearchPlaceholder"),
                                            placeholder: t("common.currencySearchPlaceholder"),
                                            emptyMessage: t("common.currencySearchEmpty"),
                                        }}
                                        menuClassName="w-[min(20rem,calc(100vw-2rem))]"
                                        ground="page"
                                        className="sm:col-span-2"
                                    />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <PreferenceField
                                        label={t("auth.signUp.language")}
                                        placeholder={t("auth.signUp.pleaseSelect")}
                                        value={field.value}
                                        options={languageOptions}
                                        onChange={field.onChange}
                                        ground="page"
                                    />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unitSystem"
                                render={({ field }) => (
                                    <PreferenceField
                                        label={t("auth.signUp.unitSystem")}
                                        placeholder={t("auth.signUp.pleaseSelect")}
                                        value={field.value}
                                        options={unitOptions}
                                        onChange={field.onChange}
                                        ground="page"
                                    />
                                )}
                            />
                        </div>
                    </FieldGroup>

                    <FormField
                        control={form.control}
                        name="showUnassessedOrSensitiveContent"
                        render={({ field }) => (
                            <FormItem className="gap-0">
                                <CheckboxPanel
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    inputRef={field.ref}
                                    disabled={isBusy}
                                    emphasizeLabel
                                    label={t("auth.signUp.showUnassessedOrSensitiveContentLabel")}
                                    description={t(
                                        "auth.signUp.showUnassessedOrSensitiveContentTooltip",
                                    )}
                                />
                            </FormItem>
                        )}
                    />

                    {newsletterEmail && (
                        <FormField
                            control={form.control}
                            name="newsletterRequest"
                            render={({ field }) => (
                                <FormItem className="gap-0">
                                    <CheckboxPanel
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        inputRef={field.ref}
                                        disabled={isBusy}
                                        label={t("newsletter.purpose")}
                                        description={
                                            <Trans
                                                i18nKey="auth.userDetails.newsletter.doubleOptIn"
                                                values={{ email: newsletterEmail }}
                                                components={{
                                                    privacyLink: (
                                                        <Link
                                                            to="/$lng/privacy"
                                                            className={cn(
                                                                AUTH_LINK_CLASS,
                                                                "font-normal",
                                                            )}
                                                            params={true}
                                                            from="/$lng"
                                                        />
                                                    ),
                                                }}
                                            />
                                        }
                                    />
                                </FormItem>
                            )}
                        />
                    )}

                    {form.formState.errors.root && (
                        <AuthFormAlert>{form.formState.errors.root.message}</AuthFormAlert>
                    )}

                    <div className="flex flex-col gap-2 border-t border-line-subtle pt-5">
                        <button
                            type="submit"
                            disabled={isBusy}
                            className={AUTH_PRIMARY_BUTTON_CLASS}
                        >
                            {isBusy && <Spinner aria-hidden="true" />}
                            {t("auth.userDetails.submit")}
                        </button>
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isBusy}
                            className={AUTH_GHOST_BUTTON_CLASS}
                        >
                            {t("auth.userDetails.skip")}
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

function FieldGroup({ label, children }: { readonly label: string; readonly children: ReactNode }) {
    const labelId = useId();
    return (
        <div role="group" aria-labelledby={labelId} className="flex flex-col gap-4">
            <span id={labelId} className="font-mono text-kicker text-ink-muted uppercase">
                {label}
            </span>
            {children}
        </div>
    );
}

function UserDetailsFormSkeleton() {
    return (
        <div className="flex flex-col gap-7" aria-busy="true">
            <Skeleton className="h-6 w-full rounded-xs" />
            <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-32 rounded-xs" />
                <Skeleton className="h-11 w-3/4" />
                <Skeleton className="h-5 w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-[4.5rem] w-full" />
                <Skeleton className="h-[4.5rem] w-full" />
            </div>
            <Skeleton className="h-[4.5rem] w-full" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-[4.5rem] w-full" />
                <Skeleton className="h-[4.5rem] w-full" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-pill" />
        </div>
    );
}
