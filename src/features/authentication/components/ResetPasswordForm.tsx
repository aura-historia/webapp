import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { Trans, useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
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
import {
    PasswordPolicyChecklist,
    PasswordPolicyFormControl,
} from "@/components/common/PasswordPolicyChecklist.tsx";
import { AuthFormAlert } from "@/features/authentication/components/AuthFormAlert.tsx";
import { AuthFormHeader } from "@/features/authentication/components/AuthFormHeader.tsx";
import { CODE_LENGTH, CodeInput } from "@/features/authentication/components/CodeInput.tsx";
import { PasswordInput } from "@/features/authentication/components/PasswordInput.tsx";
import { FOCUS_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import {
    AUTH_FIELD_CLASS,
    AUTH_FIELD_MESSAGE_CLASS,
    AUTH_LABEL_CLASS,
    AUTH_PRIMARY_BUTTON_CLASS,
} from "@/features/authentication/lib/authStyles.ts";
import { cn } from "@/lib/utils.ts";

const requestSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z.object({
        email: z.email(t("validation.email.invalid")),
    });

const confirmSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z
        .object({
            code: z
                .string()
                .length(CODE_LENGTH, t("validation.confirmCode.length"))
                .regex(/^\d+$/, t("validation.confirmCode.digitsOnly")),
            password: z
                .string()
                .min(8, t("amplify.passwordMustHaveAtLeast8Chars"))
                .regex(/[A-Z]/, t("amplify.passwordMustHaveUppercase"))
                .regex(/[a-z]/, t("amplify.passwordMustHaveLowercase"))
                .regex(/\d/, t("amplify.passwordMustHaveNumeric"))
                .regex(/[^A-Za-z0-9]/, t("amplify.passwordMustHaveSymbol")),
            confirmPassword: z.string().min(1, t("validation.password.required")),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t("validation.password.mismatch"),
            path: ["confirmPassword"],
        });

type RequestValues = z.infer<ReturnType<typeof requestSchema>>;
type ConfirmValues = z.infer<ReturnType<typeof confirmSchema>>;

type ResetPasswordFormProps = {
    readonly onSwitchToSignIn: () => void;
    readonly onSuccess: () => void;
};

function BackToSignInButton({ onClick }: { readonly onClick: () => void }) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "-my-3 inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-xs text-body-sm text-ink-secondary transition-colors hover:text-ink",
                FOCUS_CLASS,
            )}
        >
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {t("auth.resetPassword.backToSignIn")}
        </button>
    );
}

type ResetPasswordConfirmStepProps = {
    readonly email: string;
    readonly onSwitchToSignIn: () => void;
    readonly onSuccess: () => void;
};

function ResetPasswordConfirmStep({
    email,
    onSwitchToSignIn,
    onSuccess,
}: ResetPasswordConfirmStepProps) {
    const { t } = useTranslation();
    const schema = confirmSchema(t);
    const checklistId = useId();

    const form = useForm<ConfirmValues>({
        resolver: zodResolver(schema),
        defaultValues: { code: "", password: "", confirmPassword: "" },
    });
    const password = form.watch("password");
    const isSubmitting = form.formState.isSubmitting;

    const onSubmit = async (data: ConfirmValues) => {
        try {
            await confirmResetPassword({
                username: email,
                confirmationCode: data.code.trim(),
                newPassword: data.password,
            });
            toast.success(t("auth.resetPassword.success"));
            onSuccess();
        } catch (err) {
            const message = getAuthErrorMessage(err, t);
            form.setError("root", { message });
        }
    };

    return (
        <div className="flex flex-col gap-7">
            <BackToSignInButton onClick={onSwitchToSignIn} />

            <AuthFormHeader
                eyebrow={t("auth.resetPassword.eyebrow")}
                titleKey="auth.resetPassword.confirmTitle"
                lead={
                    <Trans
                        i18nKey="auth.resetPassword.confirmSubtitle"
                        values={{ email }}
                        components={{ email: <span className="font-medium text-ink" /> }}
                    />
                }
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-5"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem className="gap-2">
                                <FormLabel className={AUTH_LABEL_CLASS}>
                                    {t("auth.resetPassword.codeLabel")}
                                </FormLabel>
                                <FormControl>
                                    <CodeInput {...field} disabled={isSubmitting} />
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
                                    {t("auth.resetPassword.newPasswordLabel")}
                                </FormLabel>
                                <PasswordPolicyFormControl checklistId={checklistId}>
                                    <PasswordInput
                                        {...field}
                                        autoComplete="new-password"
                                        placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
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
                                    {t("auth.resetPassword.newPasswordConfirmLabel")}
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

                    {form.formState.errors.root && (
                        <AuthFormAlert>{form.formState.errors.root.message}</AuthFormAlert>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(AUTH_PRIMARY_BUTTON_CLASS, "mt-1")}
                    >
                        {isSubmitting && <Spinner aria-hidden="true" />}
                        {t("auth.resetPassword.confirmSubmit")}
                    </button>
                </form>
            </Form>
        </div>
    );
}

export function ResetPasswordForm({ onSwitchToSignIn, onSuccess }: ResetPasswordFormProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<"request" | "confirm">("request");
    const [email, setEmail] = useState("");

    const reqSchema = requestSchema(t);

    const requestForm = useForm<RequestValues>({
        resolver: zodResolver(reqSchema),
        defaultValues: { email: "" },
    });
    const isSubmitting = requestForm.formState.isSubmitting;

    const onRequestSubmit = async (data: RequestValues) => {
        try {
            await resetPassword({ username: data.email.trim() });
            setEmail(data.email.trim());
            setStep("confirm");
        } catch (err) {
            const message = getAuthErrorMessage(err, t);
            requestForm.setError("root", { message });
        }
    };

    if (step === "confirm") {
        return (
            <ResetPasswordConfirmStep
                email={email}
                onSwitchToSignIn={onSwitchToSignIn}
                onSuccess={onSuccess}
            />
        );
    }

    return (
        <div className="flex flex-col gap-7">
            <BackToSignInButton onClick={onSwitchToSignIn} />

            <AuthFormHeader
                eyebrow={t("auth.resetPassword.eyebrow")}
                titleKey="auth.resetPassword.title"
                lead={t("auth.resetPassword.subtitle")}
            />

            <Form {...requestForm}>
                <form
                    onSubmit={requestForm.handleSubmit(onRequestSubmit)}
                    className="flex flex-col gap-5"
                    noValidate
                >
                    <FormField
                        control={requestForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="gap-2">
                                <FormLabel className={AUTH_LABEL_CLASS}>
                                    {t("auth.resetPassword.emailLabel")}
                                </FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="email"
                                        autoComplete="email"
                                        placeholder={t("auth.resetPassword.emailPlaceholder")}
                                        disabled={isSubmitting}
                                        className={AUTH_FIELD_CLASS}
                                    />
                                </FormControl>
                                <FormMessage className={AUTH_FIELD_MESSAGE_CLASS} />
                            </FormItem>
                        )}
                    />

                    {requestForm.formState.errors.root && (
                        <AuthFormAlert>{requestForm.formState.errors.root.message}</AuthFormAlert>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(AUTH_PRIMARY_BUTTON_CLASS, "mt-1")}
                    >
                        {isSubmitting && <Spinner aria-hidden="true" />}
                        {t("auth.resetPassword.submit")}
                    </button>
                </form>
            </Form>
        </div>
    );
}
