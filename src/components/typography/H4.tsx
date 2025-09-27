import { cn } from "@/lib/utils.ts";
import type React from "react";

interface H4Props extends React.HTMLAttributes<HTMLHeadingElement> {
    readonly variant?: "default" | "muted";
    readonly children: React.ReactNode;
}

export function H4({ variant = "default", className, children, ...props }: H4Props) {
    return (
        <h4
            className={cn(
                "text-xl font-semibold",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </h4>
    );
}
