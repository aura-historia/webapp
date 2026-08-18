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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/lib/auth/getAuthErrorMessage";
import { Spinner } from "@/components/ui/spinner";

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
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl text-primary">{t("auth.signIn.title")}</h1>
                <p className="text-sm text-muted-foreground">{t("auth.signIn.subtitle")}</p>
            </div>

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
                                <FormLabel>{t("auth.signIn.email")}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="email"
                                        autoComplete="email"
                                        placeholder={t("auth.signIn.emailPlaceholder")}
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
                                <div className="flex items-center justify-between">
                                    <FormLabel>{t("auth.signIn.password")}</FormLabel>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={onSwitchToResetPassword}
                                        className="h-auto p-0 text-xs font-medium"
                                        tabIndex={-1}
                                    >
                                        {t("auth.signIn.forgotPassword")}
                                    </Button>
                                </div>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder={t("auth.signIn.passwordPlaceholder")}
                                        className="h-11 bg-transparent"
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
                        {t("auth.signIn.submit")}
                    </Button>
                </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground">
                {t("auth.signIn.noAccount")}{" "}
                <Button
                    type="button"
                    variant="link"
                    onClick={onSwitchToSignUp}
                    className="h-auto p-0 font-medium"
                >
                    {t("auth.signIn.signUpLink")}
                </Button>
            </p>
        </div>
    );
}
