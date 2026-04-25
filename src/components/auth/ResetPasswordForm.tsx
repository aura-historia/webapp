import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/lib/auth/getAuthErrorMessage";
import { Spinner } from "@/components/ui/spinner";

const requestSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z.object({
        email: z.email(t("validation.email.invalid")),
    });

const confirmSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z
        .object({
            code: z
                .string()
                .length(6, t("validation.confirmCode.length"))
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

export function ResetPasswordForm({ onSwitchToSignIn, onSuccess }: ResetPasswordFormProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<"request" | "confirm">("request");
    const [email, setEmail] = useState("");

    const reqSchema = requestSchema(t);
    const confSchema = confirmSchema(t);

    const requestForm = useForm<RequestValues>({
        resolver: zodResolver(reqSchema),
        defaultValues: { email: "" },
    });

    const confirmForm = useForm<ConfirmValues>({
        resolver: zodResolver(confSchema),
        defaultValues: { code: "", password: "" },
    });

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

    const onConfirmSubmit = async (data: ConfirmValues) => {
        try {
            await confirmResetPassword({
                username: email,
                confirmationCode: data.code.trim(),
                newPassword: data.password,
            });
            onSuccess();
        } catch (err) {
            const message = getAuthErrorMessage(err, t);
            confirmForm.setError("root", { message });
        }
    };

    if (step === "request") {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="font-display text-2xl text-primary">
                        {t("auth.resetPassword.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("auth.resetPassword.subtitle")}
                    </p>
                </div>

                <Form {...requestForm}>
                    <form
                        onSubmit={requestForm.handleSubmit(onRequestSubmit)}
                        className="flex flex-col gap-4"
                        noValidate
                    >
                        <FormField
                            control={requestForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.resetPassword.emailLabel")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            autoComplete="email"
                                            placeholder={t("auth.resetPassword.emailPlaceholder")}
                                            className="h-11 bg-transparent"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {requestForm.formState.errors.root && (
                            <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {requestForm.formState.errors.root.message}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={requestForm.formState.isSubmitting}
                            className="mt-2 w-full"
                        >
                            {requestForm.formState.isSubmitting && <Spinner />}
                            {t("auth.resetPassword.submit")}
                        </Button>
                    </form>
                </Form>

                <p className="text-center text-sm text-muted-foreground">
                    <Button
                        type="button"
                        variant="link"
                        onClick={onSwitchToSignIn}
                        className="h-auto p-0 font-medium"
                    >
                        {t("auth.resetPassword.backToSignIn")}
                    </Button>
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl text-primary">
                    {t("auth.resetPassword.confirmTitle")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("auth.resetPassword.confirmSubtitle")}
                </p>
            </div>

            <Form {...confirmForm}>
                <form
                    onSubmit={confirmForm.handleSubmit(onConfirmSubmit)}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <FormField
                        control={confirmForm.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("auth.resetPassword.codeLabel")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        placeholder={t("auth.resetPassword.codePlaceholder")}
                                        className="h-11 bg-transparent text-center tracking-[0.5em] text-lg"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={confirmForm.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("auth.resetPassword.newPasswordLabel")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                                        className="h-11 bg-transparent"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={confirmForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {t("auth.resetPassword.newPasswordConfirmLabel")}
                                </FormLabel>
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

                    {confirmForm.formState.errors.root && (
                        <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {confirmForm.formState.errors.root.message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={confirmForm.formState.isSubmitting}
                        className="mt-2 w-full"
                    >
                        {confirmForm.formState.isSubmitting && <Spinner />}
                        {t("auth.resetPassword.confirmSubmit")}
                    </Button>
                </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground">
                <Button
                    type="button"
                    variant="link"
                    onClick={onSwitchToSignIn}
                    className="h-auto p-0 font-medium"
                >
                    {t("auth.resetPassword.backToSignIn")}
                </Button>
            </p>
        </div>
    );
}
