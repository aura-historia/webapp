import { cn } from "@/lib/utils.ts";
import type React from "react";

interface H1Props extends React.HTMLAttributes<HTMLHeadingElement> {
    readonly variant?: "default" | "muted";
    readonly children: React.ReactNode;
}

export function H1({ variant = "default", className, children, ...props }: H1Props) {
    return (
        <h1
            className={cn(
                "text-3xl sm:text-4xl font-bold  hyphens-auto",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </h1>
    );
}
