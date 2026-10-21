import { Check } from "lucide-react";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { FormControl, useFormField } from "@/components/ui/form";
import { cn } from "@/lib/utils.ts";

/** The Cognito password policy, in the order the checklist shows it. */
export const PASSWORD_RULES = [
    {
        key: "length",
        labelKey: "account.changePassword.rules.length",
        test: (v: string) => v.length >= 8,
    },
    {
        key: "uppercase",
        labelKey: "account.changePassword.rules.uppercase",
        test: (v: string) => /[A-Z]/.test(v),
    },
    {
        key: "lowercase",
        labelKey: "account.changePassword.rules.lowercase",
        test: (v: string) => /[a-z]/.test(v),
    },
    {
        key: "number",
        labelKey: "account.changePassword.rules.number",
        test: (v: string) => /[0-9]/.test(v),
    },
    {
        key: "symbol",
        labelKey: "account.changePassword.rules.symbol",
        test: (v: string) => /[^A-Za-z0-9]/.test(v),
    },
] as const;

type PasswordPolicyChecklistProps = {
    readonly id: string;
    readonly password: string;
    /** Ground and layout of the inset panel; it differs between a raised card and the page. */
    readonly className?: string;
    /** Two columns from 640px (default) or always one. */
    readonly columns?: "responsive" | "single";
};

/** Live password policy: an oxblood check per rule as it is met, and an "N of 5" count. */
export function PasswordPolicyChecklist({
    id,
    password,
    className,
    columns = "responsive",
}: PasswordPolicyChecklistProps) {
    const { t } = useTranslation();
    const rules = PASSWORD_RULES.map((rule) => ({ ...rule, valid: rule.test(password) }));
    const metCount = rules.filter((rule) => rule.valid).length;

    return (
        <div id={id} className={cn("flex flex-col gap-3 rounded-lg p-4 shadow-field", className)}>
            <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-kicker text-ink-muted uppercase">
                    {t("account.changePassword.policyTitle")}
                </span>
                <span aria-live="polite" className="font-mono text-tag text-ink-muted uppercase">
                    {t("account.changePassword.policyProgress", {
                        met: metCount,
                        total: rules.length,
                    })}
                </span>
            </div>
            <ul
                className={cn(
                    "grid grid-cols-1 gap-x-5 gap-y-2",
                    columns === "responsive" && "sm:grid-cols-2",
                )}
            >
                {rules.map((rule) => (
                    <li
                        key={rule.key}
                        className={cn(
                            "flex min-h-6 items-center gap-2.5 text-meta",
                            rule.valid ? "text-ink" : "text-ink-muted",
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "inline-flex size-4 shrink-0 items-center justify-center rounded-pill text-on-oxblood",
                                rule.valid
                                    ? "bg-oxblood"
                                    : "shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
                            )}
                        >
                            {rule.valid && <Check className="size-2.5" strokeWidth={3.4} />}
                        </span>
                        <span>
                            {t(rule.labelKey)}
                            <span className="sr-only">
                                {" "}
                                {t(
                                    rule.valid
                                        ? "account.changePassword.rules.met"
                                        : "account.changePassword.rules.notMet",
                                )}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * FormControl for a new-password field: describes it by the policy checklist (which sits
 * outside its FormItem) and, while invalid, by its validation message.
 */
export function PasswordPolicyFormControl({
    checklistId,
    children,
}: {
    readonly checklistId: string;
    readonly children: ReactElement;
}) {
    const { error, formMessageId } = useFormField();

    return (
        <FormControl aria-describedby={error ? `${checklistId} ${formMessageId}` : checklistId}>
            {children}
        </FormControl>
    );
}
