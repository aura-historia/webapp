import { Check } from "lucide-react";
import { type ReactNode, type Ref, useId } from "react";
import { FormControl } from "@/components/ui/form";
import { AUTH_PANEL_CLASS } from "@/features/authentication/lib/authStyles.ts";
import { cn } from "@/lib/utils.ts";

type CheckboxPanelProps = {
    readonly checked: boolean;
    readonly onCheckedChange: (checked: boolean) => void;
    readonly onBlur?: () => void;
    readonly name?: string;
    readonly inputRef?: Ref<HTMLInputElement>;
    readonly disabled?: boolean;
    readonly label: ReactNode;
    readonly description: ReactNode;
    /** Short labels are set in medium weight; a long consent sentence stays regular. */
    readonly emphasizeLabel?: boolean;
};

/**
 * A checkbox in an inset panel with a label and a description, as on the account page.
 * Render it inside a `FormItem`; the native input is the form control.
 */
export function CheckboxPanel({
    checked,
    onCheckedChange,
    onBlur,
    name,
    inputRef,
    disabled,
    label,
    description,
    emphasizeLabel = false,
}: CheckboxPanelProps) {
    const labelId = useId();
    const descriptionId = useId();

    return (
        <label
            className={cn(
                AUTH_PANEL_CLASS,
                "flex cursor-pointer items-start gap-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass has-disabled:cursor-not-allowed has-disabled:opacity-60",
            )}
        >
            <FormControl>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onCheckedChange(event.target.checked)}
                    onBlur={onBlur}
                    name={name}
                    ref={inputRef}
                    disabled={disabled}
                    aria-labelledby={labelId}
                    aria-describedby={descriptionId}
                    className="peer sr-only"
                />
            </FormControl>
            <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] bg-surface text-on-oxblood shadow-[inset_0_0_0_1.5px_var(--line-strong)] peer-checked:bg-oxblood peer-checked:shadow-none [&>svg]:invisible peer-checked:[&>svg]:visible"
            >
                <Check className="size-3" strokeWidth={3.2} />
            </span>
            <span className="flex min-w-0 flex-col gap-1.5">
                <span
                    id={labelId}
                    className={cn(
                        "text-body-sm text-ink",
                        emphasizeLabel ? "leading-[1.4] font-medium" : "leading-normal",
                    )}
                >
                    {label}
                </span>
                <span
                    id={descriptionId}
                    className="text-meta leading-[1.55] text-ink-secondary wrap-anywhere"
                >
                    {description}
                </span>
            </span>
        </label>
    );
}
