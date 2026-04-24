import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "aws-amplify/auth";
import { useTranslation } from "react-i18next";
import { setIsSignUpFlow } from "@/stores/registrationStore";
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

const signUpSchema = (t: ReturnType<typeof useTranslation>["t"]) =>
    z
        .object({
            email: z.email(t("validation.email.invalid")),
            password: z
                .string()
                .min(8, t("amplify.passwordMustHaveAtLeast8Chars"))
                .regex(/[A-Z]/, t("amplify.passwordMustHaveUppercase"))
                .regex(/[a-z]/, t("amplify.passwordMustHaveLowercase"))
                .regex(/[0-9]/, t("amplify.passwordMustHaveNumeric"))
                .regex(/[^A-Za-z0-9]/, t("amplify.passwordMustHaveSymbol")),
            confirmPassword: z.string().min(1, t("validation.password.required")),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t("validation.password.mismatch"),
            path: ["confirmPassword"],
        });

type SignUpValues = z.infer<ReturnType<typeof signUpSchema>>;

type SignUpFormProps = {
    onSuccess: (email: string, password: string) => void;
    onSwitchToSignIn: () => void;
};

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
    const { t } = useTranslation();
    const schema = signUpSchema(t);

    const form = useForm<SignUpValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = async (data: SignUpValues) => {
        try {
            setIsSignUpFlow(true);
            await signUp({
                username: data.email.trim(),
                password: data.password,
                options: { userAttributes: { email: data.email.trim() } },
            });
            onSuccess(data.email.trim(), data.password);
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
