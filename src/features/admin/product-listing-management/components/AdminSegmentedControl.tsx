import { useId } from "react";
import { cn } from "@/lib/utils.ts";

export type AdminSegmentOption<T extends string> = {
    readonly value: T;
    readonly label: string;
    /** Accessible name when the visible label is a symbol (e.g. "—" for "Not specified"). */
    readonly ariaLabel?: string;
};

/**
 * A segmented single choice (boards "Admin · Product listing" and "Admin · Auction record"): a
 * sunken pill track with native radios; the chosen segment is raised.
 */
export function AdminSegmentedControl<T extends string>({
    label,
    labelledBy,
    value,
    options,
    onChange,
    disabled = false,
    fill = false,
}: {
    /** Accessible group name when no visible label names it. */
    readonly label?: string;
    readonly labelledBy?: string;
    readonly value: T;
    readonly options: readonly AdminSegmentOption<T>[];
    readonly onChange: (value: T) => void;
    readonly disabled?: boolean;
    /** Stretch the segments over the full width. */
    readonly fill?: boolean;
}) {
    const name = useId();
    return (
        <div
            role="radiogroup"
            aria-label={label}
            aria-labelledby={labelledBy}
            aria-disabled={disabled || undefined}
            className={cn(
                "flex max-w-full flex-wrap rounded-pill bg-surface-sunken p-1",
                fill ? "w-full" : "self-start",
            )}
        >
            {options.map((option) => {
                const checked = option.value === value;
                return (
                    <label
                        key={option.value}
                        className={cn(
                            "inline-flex min-h-9 items-center justify-center rounded-pill px-3.5 text-meta has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brass",
                            fill && "flex-1",
                            checked
                                ? "bg-surface-raised font-medium text-ink shadow-ring"
                                : "text-ink-secondary",
                            disabled ? "cursor-not-allowed" : "cursor-pointer",
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={checked}
                            disabled={disabled}
                            aria-label={option.ariaLabel}
                            onChange={() => onChange(option.value)}
                            className="sr-only"
                        />
                        <span aria-hidden={option.ariaLabel ? true : undefined}>
                            {option.label}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
