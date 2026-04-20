import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useChangePassword } from "@/hooks/account/useChangePassword";
import { cn } from "@/lib/utils";

function getChangePasswordSchema(t: (key: string) => string) {
    return z
        .object({
            currentPassword: z.string().min(1, t("amplify.passwordCannotBeEmpty")),
            newPassword: z
                .string()
                .min(8, t("amplify.passwordMustHaveAtLeast8Chars"))
                .regex(/[A-Z]/, t("amplify.passwordMustHaveUppercase"))
                .regex(/[a-z]/, t("amplify.passwordMustHaveLowercase"))
                .regex(/[0-9]/, t("amplify.passwordMustHaveNumeric"))
                .regex(/[^A-Za-z0-9]/, t("amplify.passwordMustHaveSymbol")),
            confirmPassword: z.string().min(1, t("amplify.passwordCannotBeEmpty")),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            path: ["confirmPassword"],
            message: t("amplify.yourPasswordsMustMatch"),
        });
}

type ChangePasswordFormData = z.infer<ReturnType<typeof getChangePasswordSchema>>;

export function ChangePasswordForm() {
    const { t } = useTranslation();
    const { mutate: changePassword, isPending } = useChangePassword();

    const schema = useMemo(() => getChangePasswordSchema((key: string) => t(key)), [t]);

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const newPassword = form.watch("newPassword");
    const passwordPolicyChecks = [
        {
            key: "at-least-8",
            label: t("amplify.passwordMustHaveAtLeast8Chars"),
            valid: newPassword.length >= 8,
        },
        {
            key: "uppercase",
            label: t("amplify.passwordMustHaveUppercase"),
            valid: /[A-Z]/.test(newPassword),
        },
        {
            key: "lowercase",
            label: t("amplify.passwordMustHaveLowercase"),
            valid: /[a-z]/.test(newPassword),
        },
        {
            key: "number",
            label: t("amplify.passwordMustHaveNumeric"),
            valid: /[0-9]/.test(newPassword),
        },
        {
            key: "symbol",
            label: t("amplify.passwordMustHaveSymbol"),
            valid: /[^A-Za-z0-9]/.test(newPassword),
        },
    ];

    const onSubmit = (data: ChangePasswordFormData) => {
        changePassword(
            {
                oldPassword: data.currentPassword,
                newPassword: data.newPassword,
            },
            {
                onSuccess: () => {
                    toast.success(t("account.changePassword.successMessage"));
                    form.reset();
                },
                onError: (error) => {
                    toast.error(error.message || t("account.changePassword.errorMessage"));
                },
            },
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {t("account.changePassword.currentPasswordLabel")}
                            </FormLabel>
                            <FormControl>
                                <Input {...field} type="password" className="h-12 bg-transparent" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("account.changePassword.newPasswordLabel")}</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" className="h-12 bg-transparent" />
                            </FormControl>
                            <div className="text-muted-foreground text-sm">
                                <ul className="space-y-1 pl-5 list-disc">
                                    {passwordPolicyChecks.map((rule) => (
                                        <li
                                            key={rule.key}
                                            className={cn(
                                                "text-xs",
                                                rule.valid
                                                    ? "text-emerald-600"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            {rule.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {t("account.changePassword.confirmPasswordLabel")}
                            </FormLabel>
                            <FormControl>
                                <Input {...field} type="password" className="h-12 bg-transparent" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Spinner />}
                    {t("account.changePassword.saveButton")}
                </Button>
            </form>
        </Form>
    );
}
