import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

/** Form-level error of an auth step: an oxblood-ringed inset panel above the submit button. */
export function AuthFormAlert({ children }: { readonly children: ReactNode }) {
    return (
        <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg bg-surface-raised px-3.5 py-3 text-body-sm leading-normal text-ink shadow-[inset_0_0_0_1px_var(--oxblood)]"
        >
            <CircleAlert
                aria-hidden="true"
                className="mt-[3px] size-4 shrink-0 text-oxblood"
                strokeWidth={2}
            />
            <span>{children}</span>
        </div>
    );
}
