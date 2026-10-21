import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "aws-amplify/auth";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

import { useId } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    PasswordPolicyChecklist,
    PasswordPolicyFormControl,
} from "@/components/common/PasswordPolicyChecklist.tsx";
import { getAuthErrorMessage } from "@/features/authentication/lib/getAuthErrorMessage.ts";
import { Spinner } from "@/components/ui/spinner";
import { FederatedAuthOptions } from "@/features/authentication/components/FederatedAuthOptions.tsx";
import { AuthFormAlert } from "@/features/authentication/components/AuthFormAlert.tsx";
import { AuthFormHeader } from "@/features/authentication/components/AuthFormHeader.tsx";
import { CheckboxPanel } from "@/features/authentication/components/CheckboxPanel.tsx";
import { PasswordInput } from "@/features/authentication/components/PasswordInput.tsx";
import { RegistrationSteps } from "@/features/authentication/components/RegistrationSteps.tsx";
import {
    AUTH_FIELD_CLASS,
    AUTH_FIELD_MESSAGE_CLASS,
    AUTH_FOOTER_CLASS,
    AUTH_LABEL_CLASS,
    AUTH_LINK_CLASS,
    AUTH_PRIMARY_BUTTON_CLASS,
} from "@/features/authentication/lib/authStyles.ts";
import { cn } from "@/lib/utils.ts";

const signUpSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z
        .object({
            email: z.email(t("validation.email.invalid")),
            password: z
                .string()
                .min(8, t("amplify.passwordMustHaveAtLeast8Chars"))
                .regex(/[A-Z]/, t("amplify.passwordMustHaveUppercase"))
                .regex(/[a-z]/, t("amplify.passwordMustHaveLowercase"))
                .regex(/\d/, t("amplify.passwordMustHaveNumeric"))
                .regex(/[^A-Za-z0-9]/, t("amplify.passwordMustHaveSymbol")),
            confirmPassword: z.string().min(1, t("validation.password.required")),
            marketingConsent: z.boolean(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t("validation.password.mismatch"),
            path: ["confirmPassword"],
        });

type SignUpValues = z.infer<ReturnType<typeof signUpSchema>>;

type SignUpFormProps = {
    readonly onSuccess: (email: string, password: string) => void;
    readonly onSwitchToSignIn: () => void;
    readonly locale: string;
    readonly redirect?: string;
};

export function SignUpForm({ onSuccess, onSwitchToSignIn, locale, redirect }: SignUpFormProps) {
    const { t } = useTranslation();
    const schema = signUpSchema(t);

    const form = useForm<SignUpValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "", confirmPassword: "", marketingConsent: false },
    });

    const checklistId = useId();
    const password = form.watch("password");
    const isSubmitting = form.formState.isSubmitting;

    const onSubmit = async (data: SignUpValues) => {
        const email = data.email.trim();

        try {
            // The immutable Cognito attribute records only this signup request; the backend
            // applies it after verified confirmation, so no newsletter request is sent here.
            await signUp({
                username: email,
                password: data.password,
                options: {
                    userAttributes: {
                        email,
                        "custom:marketing_consent": data.marketingConsent ? "true" : "false",
                    },
                },
            });
            onSuccess(email, data.password);
        } catch (err) {
            const message = getAuthErrorMessage(err, t);
            form.setError("root", { message });
        }
    };

    return (
        <div className="flex flex-col gap-7">
            <RegistrationSteps current={1} />

            <AuthFormHeader
                eyebrow={t("auth.signUp.eyebrow")}
                titleKey="auth.signUp.title"
                lead={t("auth.signUp.subtitle")}
            />

            <FederatedAuthOptions intent="sign-up" locale={locale} redirect={redirect} />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-5"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="gap-2">
                                <FormLabel className={AUTH_LABEL_CLASS}>
                                    {t("auth.signUp.email")}
                                </FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="email"
                                        autoComplete="email"
                                        placeholder={t("auth.signUp.emailPlaceholder")}
                                        disabled={isSubmitting}
                                        className={AUTH_FIELD_CLASS}
                                    />
                                </FormControl>
                                <FormMessage className={AUTH_FIELD_MESSAGE_CLASS} />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="gap-2">
                                <FormLabel className={AUTH_LABEL_CLASS}>
                                    {t("auth.signUp.password")}
                                </FormLabel>
                                <PasswordPolicyFormControl checklistId={checklistId}>
                                    <PasswordInput
                                        {...field}
                                        autoComplete="new-password"
                                        placeholder={t("auth.signUp.passwordPlaceholder")}
                                        disabled={isSubmitting}
                                    />
                                </PasswordPolicyFormControl>
                                <FormMessage className={AUTH_FIELD_MESSAGE_CLASS} />
                            </FormItem>
                        )}
                    />

                    <PasswordPolicyChecklist
                        id={checklistId}
                        password={password}
                        className="bg-surface-raised"
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem className="gap-2">
                                <FormLabel className={AUTH_LABEL_CLASS}>
                                    {t("auth.signUp.confirmPassword")}
                                </FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        {...field}
                                        autoComplete="new-password"
                                        placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage className={AUTH_FIELD_MESSAGE_CLASS} />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="marketingConsent"
                        render={({ field }) => (
                            <FormItem className="gap-0">
                                <CheckboxPanel
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    inputRef={field.ref}
                                    disabled={isSubmitting}
                                    label={t("newsletter.purpose")}
                                    description={
                                        <Trans
                                            i18nKey="newsletter.privacy"
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

                    {form.formState.errors.root && (
                        <AuthFormAlert>{form.formState.errors.root.message}</AuthFormAlert>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(AUTH_PRIMARY_BUTTON_CLASS, "mt-1")}
                    >
                        {isSubmitting && <Spinner aria-hidden="true" />}
                        {t("auth.signUp.submit")}
                    </button>
                </form>
            </Form>

            <p className={AUTH_FOOTER_CLASS}>
                {t("auth.signUp.haveAccount")}{" "}
                <button type="button" onClick={onSwitchToSignIn} className={AUTH_LINK_CLASS}>
                    {t("auth.signUp.signInLink")}
                </button>
            </p>
        </div>
    );
}
