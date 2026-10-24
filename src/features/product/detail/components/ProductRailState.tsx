import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";

/** An empty, pending or failed rail: an icon disc, a serif title and one line of copy. */
export function ProductRailState({
    icon: Icon,
    title,
    description,
    tone = "neutral",
    spinning = false,
    raised = false,
}: {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly description: string;
    readonly tone?: "neutral" | "error" | "muted";
    readonly spinning?: boolean;
    readonly raised?: boolean;
}) {
    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={cn(
                "flex min-h-80 flex-col items-center justify-center gap-4 rounded-panel px-7 py-8 text-center shadow-ring",
                raised && "bg-surface-raised",
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "inline-flex size-13 items-center justify-center rounded-pill",
                    tone === "error"
                        ? "bg-oxblood text-on-oxblood"
                        : "bg-surface-raised shadow-ring",
                    tone === "neutral" && "text-ink",
                    tone === "muted" && "text-ink-muted",
                )}
            >
                <Icon
                    className={cn(
                        "size-5",
                        spinning &&
                            "animate-[spin_1.2s_linear_infinite] motion-reduce:animate-none",
                    )}
                    strokeWidth={1.8}
                />
            </span>
            <h3 className="font-serif text-title-md font-normal">{title}</h3>
            <p className="max-w-[280px] text-body-sm text-ink-secondary">{description}</p>
        </div>
    );
}
