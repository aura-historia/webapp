import type { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export type AdminFact = {
    readonly key: string;
    readonly label: string;
    readonly value: ReactNode;
    readonly mono?: boolean;
    readonly muted?: boolean;
};

/**
 * A ruled list of record facts: mono labels over values, in one to three columns. IDs set `mono`;
 * missing values set `muted` and pass "—".
 */
export function AdminFacts({
    facts,
    columns = 2,
    className,
}: {
    readonly facts: readonly AdminFact[];
    readonly columns?: 1 | 2 | 3;
    readonly className?: string;
}) {
    return (
        <dl
            className={cn(
                "grid border-t border-line gap-x-6",
                columns === 1 && "grid-cols-1",
                columns === 2 && "grid-cols-1 sm:grid-cols-2",
                columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                className,
            )}
        >
            {facts.map((fact) => (
                <div
                    key={fact.key}
                    className="flex min-w-0 flex-col gap-1 border-b border-line-subtle py-3"
                >
                    <dt className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase">
                        {fact.label}
                    </dt>
                    <dd
                        className={cn(
                            "break-words",
                            fact.mono ? "font-mono text-xs break-all" : "text-sm",
                            fact.muted ? "text-ink-muted" : "text-ink",
                        )}
                    >
                        {fact.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
