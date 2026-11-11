import { cn } from "@/lib/utils.ts";

/**
 * A 409 shown in place (board "Admin · States", conflicts): brass ring and mark beside one line;
 * the record has already been reloaded.
 */
export function AdminConflictNotice({
    message,
    className,
}: {
    readonly message: string;
    readonly className?: string;
}) {
    return (
        <p
            role="alert"
            className={cn(
                "flex gap-2.5 rounded-md px-3.5 py-3 text-sm leading-normal shadow-[inset_0_0_0_1.5px_var(--brass)]",
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="mt-1.5 inline-block size-[9px] shrink-0 rounded-pill shadow-[inset_0_0_0_1.5px_var(--brass)]"
            />
            {message}
        </p>
    );
}

/** A failed action shown in place: oxblood text with an alert role. */
export function AdminErrorLine({
    message,
    className,
}: {
    readonly message: string;
    readonly className?: string;
}) {
    return (
        <p role="alert" className={cn("text-meta text-oxblood", className)}>
            {message}
        </p>
    );
}
