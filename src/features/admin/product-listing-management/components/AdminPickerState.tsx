import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * A picker's one-line state (board "Admin · States", pickers): searching, nothing found or
 * failed, on an inset ground with an optional action at the end.
 */
export function PickerState({
    error = false,
    action,
    children,
}: {
    readonly error?: boolean;
    readonly action?: ReactNode;
    readonly children: ReactNode;
}) {
    return (
        <div
            role={error ? "alert" : "status"}
            className={cn(
                "flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-md bg-surface px-3.5 py-2.5 text-sm shadow-ring",
                error ? "text-oxblood" : "text-ink-secondary",
            )}
        >
            <span className="inline-flex items-center gap-2">{children}</span>
            {action}
        </div>
    );
}
