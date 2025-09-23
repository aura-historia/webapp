import type React from "react";

export function H4({
    children,
    variant = "default",
}: {
    readonly children: React.ReactNode;
    readonly variant?: "default" | "muted";
}) {
    const colorClass = variant === "muted" ? "text-muted-foreground" : "text-foreground";
    return <h1 className={`text-xl font-semibold ${colorClass}`}>{children}</h1>;
}
