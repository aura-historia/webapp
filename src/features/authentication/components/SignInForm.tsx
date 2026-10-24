import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resendSignUpCode, signIn } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { getAuthErrorMessage } from "@/features/authentication/lib/getAuthErrorMessage.ts";
import { Spinner } from "@/components/ui/spinner";
import { FederatedAuthOptions } from "@/features/authentication/components/FederatedAuthOptions.tsx";
import { AuthFormAlert } from "@/features/authentication/components/AuthFormAlert.tsx";
import { AuthFormHeader } from "@/features/authentication/components/AuthFormHeader.tsx";
import { PasswordInput } from "@/features/authentication/components/PasswordInput.tsx";
import {
    AUTH_FIELD_CLASS,
    AUTH_FIELD_MESSAGE_CLASS,
    AUTH_FOOTER_CLASS,
    AUTH_LABEL_CLASS,
    AUTH_LINK_CLASS,
    AUTH_PRIMARY_BUTTON_CLASS,
} from "@/features/authentication/lib/authStyles.ts";
import { cn } from "@/lib/utils.ts";

const signInSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z.object({
        email: z.email(t("validation.email.invalid")),
        password: z.string().min(1, t("validation.password.required")),
    });

type SignInValues = z.infer<ReturnType<typeof signInSchema>>;

type SignInFormProps = {
    readonly onSwitchToSignUp: () => void;
    readonly onSwitchToResetPassword: () => void;
    readonly onConfirmationRequired: (email: string, password: string) => void;
    readonly onSuccess: () => void;
    readonly locale: string;
    readonly redirect?: string;
};

function isUserNotConfirmedError(err: unknown): boolean {
    if (err instanceof Error && err.name === "UserNotConfirmedException") {
        return true;
    }

    if (typeof err !== "object" || err === null || !("__type" in err)) {
        return false;
    }

    return err.__type === "UserNotConfirmedException";
}

export function SignInForm({
    onSwitchToSignUp,
    onSwitchToResetPassword,
    onConfirmationRequired,
    onSuccess,
    locale,
    redirect,
}: SignInFormProps) {
    const { t } = useTranslation();
    const schema = signInSchema(t);

    const form = useForm<SignInValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const continueToConfirmation = async (email: string, password: string) => {
        try {
            await resendSignUpCode({ username: email });
        } catch {
            // The previously issued code may still be valid. The confirmation form
            // also lets the user retry delivery without repeating sign-in.
        }

        onConfirmationRequired(email, password);
    };

    const onSubmit = async (data: SignInValues) => {
        const email = data.email.trim();

        try {
            const result = await signIn({ username: email, password: data.password });

            if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
                await continueToConfirmation(email, data.password);
                return;
            }

            onSuccess();
        } catch (err) {
            if (isUserNotConfirmedError(err)) {
                await continueToConfirmation(email, data.password);
                return;
            }

            const message = getAuthErrorMessage(err, t);
            form.setError("root", { message });
        }
    };

    return (
        <div className="flex flex-col gap-7">
            <AuthFormHeader
                eyebrow={t("auth.signIn.eyebrow")}
                titleKey="auth.signIn.title"
                lead={t("auth.signIn.subtitle")}
            />

            <FederatedAuthOptions intent="sign-in" locale={locale} redirect={redirect} />

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
                                    {t("auth.signIn.email")}
                                </FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="email"
                                        autoComplete="email"
                                        placeholder={t("auth.signIn.emailPlaceholder")}
                                        disabled={form.formState.isSubmitting}
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
                                <div className="flex items-baseline justify-between gap-3">
                                    <FormLabel className={AUTH_LABEL_CLASS}>
                                        {t("auth.signIn.password")}
                                    </FormLabel>
                                    <button
                                        type="button"
                                        onClick={onSwitchToResetPassword}
                                        className={cn(
                                            AUTH_LINK_CLASS,
                                            "text-meta font-normal text-ink-secondary",
                                        )}
                                    >
                                        {t("auth.signIn.forgotPassword")}
                                    </button>
                                </div>
                                <FormControl>
                                    <PasswordInput
                                        {...field}
                                        autoComplete="current-password"
                                        placeholder={t("auth.signIn.passwordPlaceholder")}
                                        disabled={form.formState.isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage className={AUTH_FIELD_MESSAGE_CLASS} />
                            </FormItem>
                        )}
                    />

                    {form.formState.errors.root && (
                        <AuthFormAlert>{form.formState.errors.root.message}</AuthFormAlert>
                    )}

                    <button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className={cn(AUTH_PRIMARY_BUTTON_CLASS, "mt-1")}
                    >
                        {form.formState.isSubmitting && <Spinner aria-hidden="true" />}
                        {t("auth.signIn.submit")}
                    </button>
                </form>
            </Form>

            <p className={AUTH_FOOTER_CLASS}>
                {t("auth.signIn.noAccount")}{" "}
                <button type="button" onClick={onSwitchToSignUp} className={AUTH_LINK_CLASS}>
                    {t("auth.signIn.signUpLink")}
                </button>
            </p>
        </div>
    );
}
