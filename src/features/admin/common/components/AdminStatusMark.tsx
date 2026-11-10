import { cn } from "@/lib/utils.ts";

/**
 * Status marks shared by every admin section, always beside a label:
 * hollow (submitted, scheduled, withdrawn listing), brass ring (in review, postponed, attention),
 * ink (approved, active, in progress), muted (ended), oxblood (rejected, suspended), dashed
 * (withdrawn application, not reported).
 */
export type AdminMarkTone = "hollow" | "brass" | "ink" | "muted" | "oxblood" | "dashed";

const MARK_CLASS: Record<AdminMarkTone, string> = {
    hollow: "shadow-[inset_0_0_0_1.5px_var(--ink-muted)]",
    brass: "shadow-[inset_0_0_0_1.5px_var(--brass)]",
    ink: "bg-ink",
    muted: "bg-ink-muted",
    oxblood: "bg-oxblood",
    dashed: "border-[1.5px] border-dashed border-ink-muted",
};

export function AdminMark({
    tone,
    className,
}: {
    readonly tone: AdminMarkTone;
    readonly className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "inline-block size-[9px] shrink-0 rounded-pill",
                MARK_CLASS[tone],
                className,
            )}
        />
    );
}

export function AdminStatusMark({
    tone,
    label,
    className,
}: {
    readonly tone: AdminMarkTone;
    readonly label: string;
    readonly className?: string;
}) {
    return (
        <span className={cn("inline-flex items-center gap-2 text-sm whitespace-nowrap", className)}>
            <AdminMark tone={tone} />
            {label}
        </span>
    );
}
