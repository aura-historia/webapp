import { useState, type ComponentProps, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export type TagInputProps = {
    readonly value: string[];
    readonly onChange: (value: string[]) => void;
    readonly placeholder?: string;
    readonly removeTagLabel?: (tag: string) => string;
    readonly minLength?: number;
    readonly minLengthMessage?: string;
    readonly className?: string;
} & Omit<ComponentProps<"input">, "value" | "onChange" | "placeholder" | "className">;

/**
 * Free-text tag input: type a term and press Enter (or comma) to add it as a chip.
 * Backspace on an empty input removes the last tag.
 * Chips sit inside the field, before the text input. Forwards id, aria attributes, etc. to the inner
 * text input so it works inside shadcn's FormControl.
 */
export function TagInput({
    value,
    onChange,
    placeholder,
    removeTagLabel,
    minLength,
    minLengthMessage,
    className,
    ...inputProps
}: TagInputProps) {
    const [draft, setDraft] = useState("");
    const [tooShort, setTooShort] = useState(false);

    const addTag = (raw: string): boolean => {
        const tag = raw.trim();
        if (minLength !== undefined && tag !== "" && tag.length < minLength) {
            setTooShort(true);
            return false;
        }
        if (tag === "" || value.includes(tag)) return false;
        onChange([...value, tag]);
        return true;
    };

    const removeTag = (tag: string) => {
        onChange(value.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            e.stopPropagation();
            if (addTag(draft)) {
                setDraft("");
            }
        } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            removeTag(value[value.length - 1]);
        }
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div
                className={cn(
                    "flex min-h-11 flex-wrap items-center gap-1.5 rounded-md bg-surface px-2 py-1.5 shadow-field",
                    "focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-brass",
                    "has-[input[aria-invalid=true]]:shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
                )}
            >
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex h-8 items-center gap-1 rounded-pill bg-ink pr-1 pl-3 text-meta text-surface"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            aria-label={removeTagLabel?.(tag) ?? tag}
                            className="inline-flex size-[26px] cursor-pointer items-center justify-center rounded-pill outline-none focus-visible:outline-2 focus-visible:outline-brass"
                        >
                            <X className="size-3" strokeWidth={2.2} aria-hidden="true" />
                        </button>
                    </span>
                ))}
                <input
                    {...inputProps}
                    value={draft}
                    onChange={(e) => {
                        setDraft(e.target.value);
                        setTooShort(false);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (addTag(draft)) {
                            setDraft("");
                        }
                    }}
                    placeholder={placeholder}
                    className="h-8 min-w-[180px] flex-1 border-0 bg-transparent px-1.5 text-base text-ink outline-none placeholder:text-ink-placeholder sm:text-[15px]"
                />
            </div>
            {tooShort && minLengthMessage && (
                <p className="text-meta text-oxblood">{minLengthMessage}</p>
            )}
        </div>
    );
}
