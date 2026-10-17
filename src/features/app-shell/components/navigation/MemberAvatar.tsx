import { User } from "lucide-react";
import { cn } from "@/lib/utils.ts";

interface MemberAvatarProps {
    readonly initials: string;
    /** Adds the thin brass ring used on the ink ground. */
    readonly ring?: boolean;
    readonly className?: string;
}

/** Member initials on an oxblood disc; falls back to a user glyph without a name. */
export function MemberAvatar({ initials, ring = false, className }: MemberAvatarProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-oxblood text-[11px] text-on-oxblood select-none",
                ring && "shadow-[0_0_0_1px_rgba(184,147,90,0.6)]",
                className,
            )}
        >
            {initials || <User className="size-[55%]" strokeWidth={1.8} />}
        </span>
    );
}
