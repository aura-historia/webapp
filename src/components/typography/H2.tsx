import { cn } from "@/lib/utils.ts";
import type React from "react";

interface H1Props extends React.HTMLAttributes<HTMLSpanElement> {
    readonly variant?: "default" | "muted";
    readonly children: React.ReactNode;
}

export function H2({ variant = "default", className, children, ...props }: H1Props) {
    return (
        <h1
            className={cn(
                "text-3xl font-bold",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </h1>
    );
}
