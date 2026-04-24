import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { confirmSignUp, resendSignUpCode, signIn } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import { useState } from "react";
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

const confirmSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z.object({
        code: z
            .string()
            .length(6, t("validation.confirmCode.length"))
            .regex(/^\d+$/, t("validation.confirmCode.digitsOnly")),
    });

type ConfirmValues = z.infer<ReturnType<typeof confirmSchema>>;

type ConfirmSignUpFormProps = {
    readonly email: string;
    readonly password: string;
    readonly onSuccess: () => void;
};

export function ConfirmSignUpForm({ email, password, onSuccess }: ConfirmSignUpFormProps) {
    const { t } = useTranslation();
    const schema = confirmSchema(t);
    const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

    const form = useForm<ConfirmValues>({
        resolver: zodResolver(schema),
        defaultValues: { code: "" },
    });

    const onSubmit = async (data: ConfirmValues) => {
        try {
            await confirmSignUp({ username: email, confirmationCode: data.code.trim() });
            await signIn({ username: email, password });
            onSuccess();
        } catch (err) {
            const message = getAuthErrorMessage(err, t);
            form.setError("root", { message });
        }
    };

    const handleResend = async () => {
        if (resendStatus === "sending") return;
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

    const resendButtonText = {
        idle: t("auth.confirm.resend"),
        sending: t("auth.confirm.resendSending"),
        sent: t("auth.confirm.resendSent"),
    }[resendStatus];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl text-primary">{t("auth.confirm.title")}</h1>
                <p className="text-sm text-muted-foreground">
                    {t("auth.confirm.subtitle", { email })}
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("auth.confirm.codeLabel")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        placeholder={t("auth.confirm.codePlaceholder")}
                                        className="h-11 bg-transparent text-center tracking-[0.5em] text-lg"
                                    />
                                </FormControl>
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
                        disabled={form.formState.isSubmitting}
                        className="mt-2 w-full"
                    >
                        {form.formState.isSubmitting && <Spinner />}
                        {t("auth.confirm.submit")}
                    </Button>
                </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground">
                {t("auth.confirm.noCode")}{" "}
                <Button
                    type="button"
                    variant="link"
                    onClick={handleResend}
                    disabled={resendStatus !== "idle"}
                    className="h-auto p-0 font-medium"
                >
                    {resendButtonText}
                </Button>
            </p>
        </div>
    );
}
