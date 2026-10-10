import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "aws-amplify/auth";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/features/authentication/lib/getAuthErrorMessage.ts";
import { Spinner } from "@/components/ui/spinner";
import { FederatedAuthOptions } from "@/features/authentication/components/FederatedAuthOptions.tsx";

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
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl text-primary">{t("auth.signUp.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("auth.signUp.subtitle")}</p>
            </div>

            <FederatedAuthOptions intent="sign-up" locale={locale} redirect={redirect} />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("auth.signUp.email")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        autoComplete="email"
                                        placeholder={t("auth.signUp.emailPlaceholder")}
                                        className="h-11 bg-transparent"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("auth.signUp.password")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder={t("auth.signUp.passwordPlaceholder")}
                                        className="h-11 bg-transparent"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("auth.signUp.confirmPassword")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder={t("auth.signUp.confirmPasswordPlaceholder")}
                                        className="h-11 bg-transparent"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="marketingConsent"
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
                                            i18nKey="newsletter.privacy"
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

                    {form.formState.errors.root && (
                        <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {form.formState.errors.root.message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="mt-2 w-full"
                    >
                        {form.formState.isSubmitting && <Spinner />}
                        {t("auth.signUp.submit")}
                    </Button>
                </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground">
                {t("auth.signUp.haveAccount")}{" "}
                <Button
                    type="button"
                    variant="link"
                    onClick={onSwitchToSignIn}
                    className="h-auto p-0 font-medium"
                >
                    {t("auth.signUp.signInLink")}
                </Button>
            </p>
        </div>
    );
}
