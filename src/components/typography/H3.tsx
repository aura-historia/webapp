import { cn } from "@/lib/utils.ts";
import type React from "react";

interface H3Props extends React.HTMLAttributes<HTMLHeadingElement> {
    readonly variant?: "default" | "muted";
    readonly children: React.ReactNode;
}

export function H3({ variant = "default", className, children, ...props }: H3Props) {
    return (
        <h3
            className={cn(
                "text-xl font-semibold",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </h3>
    );
}
