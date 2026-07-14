import { useState, type ComponentProps, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
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
 * Forwards id, aria attributes, etc. to the inner text input so it works inside shadcn's FormControl.
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
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1">
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                aria-label={removeTagLabel?.(tag) ?? tag}
                                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                            >
                                <X className="h-3 w-3" aria-hidden="true" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            <Input
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
            />
            {tooShort && minLengthMessage && (
                <p className="text-destructive text-sm">{minLengthMessage}</p>
            )}
        </div>
    );
}
