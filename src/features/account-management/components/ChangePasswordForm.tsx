import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactElement, useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    useFormField,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { PasswordPolicyChecklist } from "@/components/common/PasswordPolicyChecklist.tsx";
import { useChangePassword } from "@/features/account-management/hooks/useChangePassword.ts";
import {
    CARD_CLASS,
    FIELD_CLASS,
    FIELD_MESSAGE_CLASS,
    FORM_FOOTER_CLASS,
    LABEL_CLASS,
    PRIMARY_BUTTON_CLASS,
} from "@/features/account-management/lib/accountStyles.ts";
import { getChangePasswordError } from "@/features/account-management/lib/changePasswordError.ts";

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

/**
 * FormControl that describes the new password by the policy checklist (outside its FormItem)
 * and, while invalid, by its validation message.
 */
function NewPasswordControl({
    rulesId,
    children,
}: {
    readonly rulesId: string;
    readonly children: ReactElement;
}) {
    const { error, formMessageId } = useFormField();

    return (
        <FormControl aria-describedby={error ? `${rulesId} ${formMessageId}` : rulesId}>
            {children}
        </FormControl>
    );
}

export function ChangePasswordForm() {
    const { t } = useTranslation();
    const { mutate: changePassword, isPending } = useChangePassword();
    const rulesId = useId();

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
                    const { field, messageKey } = getChangePasswordError(error);
                    if (field) {
                        form.setError(field, { message: t(messageKey) }, { shouldFocus: true });
                        return;
                    }
                    toast.error(t(messageKey));
                },
            },
        );
    };

    return (
        <div className={CARD_CLASS}>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    aria-label={t("account.changePassword.title")}
                    className="flex flex-col gap-6"
                >
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem className="gap-2">
                                <FormLabel className={LABEL_CLASS}>
                                    {t("account.changePassword.currentPasswordLabel")}
                                </FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="password"
                                        autoComplete="current-password"
                                        className={FIELD_CLASS}
                                    />
                                </FormControl>
                                <FormMessage className={FIELD_MESSAGE_CLASS} />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem className="gap-2">
                                    <FormLabel className={LABEL_CLASS}>
                                        {t("account.changePassword.newPasswordLabel")}
                                    </FormLabel>
                                    <NewPasswordControl rulesId={rulesId}>
                                        <input
                                            {...field}
                                            type="password"
                                            autoComplete="new-password"
                                            className={FIELD_CLASS}
                                        />
                                    </NewPasswordControl>
                                    <FormMessage className={FIELD_MESSAGE_CLASS} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem className="gap-2">
                                    <FormLabel className={LABEL_CLASS}>
                                        {t("account.changePassword.confirmPasswordLabel")}
                                    </FormLabel>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="password"
                                            autoComplete="new-password"
                                            className={FIELD_CLASS}
                                        />
                                    </FormControl>
                                    <FormMessage className={FIELD_MESSAGE_CLASS} />
                                </FormItem>
                            )}
                        />
                    </div>

                    <PasswordPolicyChecklist
                        id={rulesId}
                        password={newPassword}
                        className="bg-surface"
                    />

                    <div className={FORM_FOOTER_CLASS}>
                        <button type="submit" disabled={isPending} className={PRIMARY_BUTTON_CLASS}>
                            {isPending && <Spinner aria-hidden="true" />}
                            {t("account.changePassword.saveButton")}
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
