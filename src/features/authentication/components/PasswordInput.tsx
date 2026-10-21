import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_FIELD_CLASS } from "@/features/authentication/lib/authStyles.ts";
import { FOCUS_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import { cn } from "@/lib/utils.ts";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

/**
 * Password field with a show/hide toggle. Props (including the form control's id and aria
 * attributes) go to the input itself, so it works as the direct child of `FormControl`.
 */
export function PasswordInput({ className, id, ...props }: PasswordInputProps) {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const Icon = isVisible ? EyeOff : Eye;

    return (
        <div className="relative">
            <input
                {...props}
                id={id}
                type={isVisible ? "text" : "password"}
                className={cn(AUTH_FIELD_CLASS, "pr-13", className)}
            />
            <button
                type="button"
                aria-label={t(isVisible ? "auth.password.hide" : "auth.password.show")}
                aria-pressed={isVisible}
                aria-controls={id}
                disabled={props.disabled}
                onClick={() => setIsVisible((visible) => !visible)}
                className={cn(
                    "absolute top-0.5 right-0.5 inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed",
                    FOCUS_CLASS,
                )}
            >
                <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
            </button>
        </div>
    );
}
