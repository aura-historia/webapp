import { cn } from "@/lib/utils.ts";
import type React from "react";

interface H2Props extends React.HTMLAttributes<HTMLHeadingElement> {
    readonly variant?: "default" | "muted";
    readonly children: React.ReactNode;
}

export function H2({ variant = "default", className, children, ...props }: H2Props) {
    return (
        <h2
            className={cn(
                "text-3xl font-bold",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </h2>
    );
}
