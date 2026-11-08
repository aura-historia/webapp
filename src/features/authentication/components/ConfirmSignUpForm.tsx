import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { confirmSignUp, resendSignUpCode, signIn } from "aws-amplify/auth";
import { Trans, useTranslation } from "react-i18next";
import { useState } from "react";
import { Check } from "lucide-react";
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
import { AuthFormAlert } from "@/features/authentication/components/AuthFormAlert.tsx";
import { AuthFormHeader } from "@/features/authentication/components/AuthFormHeader.tsx";
import { CODE_LENGTH, CodeInput } from "@/features/authentication/components/CodeInput.tsx";
import { RegistrationSteps } from "@/features/authentication/components/RegistrationSteps.tsx";
import {
    AUTH_FIELD_MESSAGE_CLASS,
    AUTH_FOOTER_CLASS,
    AUTH_LABEL_CLASS,
    AUTH_LINK_CLASS,
    AUTH_PRIMARY_BUTTON_CLASS,
} from "@/features/authentication/lib/authStyles.ts";

const confirmSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z.object({
        code: z
            .string()
            .length(CODE_LENGTH, t("validation.confirmCode.length"))
            .regex(/^\d+$/, t("validation.confirmCode.digitsOnly")),
    });

type ConfirmValues = z.infer<ReturnType<typeof confirmSchema>>;

type ConfirmSignUpFormProps = {
    readonly email: string;
    /**
     * The password from this session's sign-up or sign-in attempt, used to sign the
     * confirmed user straight in. Empty whenever the step was remounted (a reload
     * restores the pending email but deliberately never persists the password).
     */
    readonly password: string;
    /** Confirmed and signed in. */
    readonly onSuccess: () => void;
    /** Confirmed, but the session must be established by signing in manually. */
    readonly onSignInRequired: () => void;
};

export function ConfirmSignUpForm({
    email,
    password,
    onSuccess,
    onSignInRequired,
}: ConfirmSignUpFormProps) {
    const { t } = useTranslation();
    const schema = confirmSchema(t);
    const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

    const form = useForm<ConfirmValues>({
        resolver: zodResolver(schema),
        defaultValues: { code: "" },
    });
    const isSubmitting = form.formState.isSubmitting;

    const handOverToSignIn = () => {
        toast.success(t("auth.confirm.confirmedSignInRequired"));
        onSignInRequired();
    };

    const onSubmit = async (data: ConfirmValues) => {
        const confirmationCode = data.code.trim();

        try {
            await confirmSignUp({ username: email, confirmationCode });
        } catch (err) {
            const message = getAuthErrorMessage(err, t);
            form.setError("root", { message });
            return;
        }

        // Confirmation spends the code, so this step can never be retried. Without a
        // password, or when signing in fails, hand over to the sign-in form rather than
        // stranding a confirmed account on a step whose code is already used.
        if (!password) {
            handOverToSignIn();
            return;
        }

        try {
            await signIn({ username: email, password });
            onSuccess();
        } catch {
            handOverToSignIn();
        }
    };

    const handleResend = async () => {
        setResendStatus("sending");
        try {
            await resendSignUpCode({ username: email });
            setResendStatus("sent");
        } catch (err) {
            const message = getAuthErrorMessage(err, t);
            form.setError("root", { message });
            setResendStatus("idle");
        }
    };

    return (
        <div className="flex flex-col gap-7">
            <RegistrationSteps current={2} />

            <AuthFormHeader
                eyebrow={t("auth.confirm.eyebrow")}
                titleKey="auth.confirm.title"
                lead={
                    <Trans
                        i18nKey="auth.confirm.subtitle"
                        values={{ email }}
                        components={{ email: <span className="font-medium text-ink" /> }}
                    />
                }
            />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-6"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem className="gap-2">
                                <FormLabel className={AUTH_LABEL_CLASS}>
                                    {t("auth.confirm.codeLabel")}
                                </FormLabel>
                                <FormControl>
                                    <CodeInput
                                        {...field}
                                        disabled={isSubmitting}
                                        onComplete={() => {
                                            form.handleSubmit(onSubmit)();
                                        }}
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
                        className={AUTH_PRIMARY_BUTTON_CLASS}
                    >
                        {isSubmitting && <Spinner aria-hidden="true" />}
                        {t("auth.confirm.submit")}
                    </button>
                </form>
            </Form>

            <div className={AUTH_FOOTER_CLASS}>
                <p aria-live="polite" className="flex flex-wrap items-center gap-x-1.5">
                    {t("auth.confirm.noCode")}
                    {resendStatus === "idle" && (
                        <button type="button" onClick={handleResend} className={AUTH_LINK_CLASS}>
                            {t("auth.confirm.resend")}
                        </button>
                    )}
                    {resendStatus === "sending" && (
                        <span className="text-ink-muted">{t("auth.confirm.resendSending")}</span>
                    )}
                    {resendStatus === "sent" && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                            <span
                                aria-hidden="true"
                                className="inline-flex size-4 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                            >
                                <Check className="size-2.5" strokeWidth={3.4} />
                            </span>
                            {t("auth.confirm.resendSent")}
                        </span>
                    )}
                </p>
                <p className="mt-1.5 text-meta leading-[1.55] text-ink-muted">
                    {t("auth.confirm.hint")}
                </p>
            </div>
        </div>
    );
}
