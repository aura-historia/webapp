import type { LucideIcon } from "lucide-react";
import { SearchX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * Empty, no-match and error states (board "Admin · States"): a 56px round icon, a serif title and
 * the actions. No description: admins know the section; the title says what happened.
 */
export function AdminStatePanel({
    tone,
    icon,
    title,
    framed = true,
    children,
    className,
}: {
    readonly tone: "empty" | "error";
    readonly icon?: LucideIcon;
    readonly title: string;
    /** Draw the hairline panel around the state (off inside dialogs). */
    readonly framed?: boolean;
    readonly children?: ReactNode;
    readonly className?: string;
}) {
    const isError = tone === "error";
    const Icon = icon ?? (isError ? TriangleAlert : SearchX);
    return (
        <div
            role={isError ? "alert" : "status"}
            className={cn(
                "flex min-h-[300px] flex-col items-center justify-center gap-4 px-6 py-12 text-center",
                framed && "rounded-panel shadow-ring",
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={
                    isError
                        ? "inline-flex size-14 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                        : "inline-flex size-14 items-center justify-center rounded-pill bg-surface-raised text-ink-muted shadow-ring"
                }
            >
                <Icon className="size-[22px]" strokeWidth={1.7} />
            </span>
            <h2 className="font-serif text-[26px] leading-[1.15] font-normal sm:text-[30px]">
                {title}
            </h2>
            {children && (
                <div className="mt-1 flex flex-wrap justify-center gap-2.5">{children}</div>
            )}
        </div>
    );
}
