import { cn } from "@/lib/utils";
import type React from "react";

interface PriceTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    readonly variant?: "default" | "muted";
    readonly children: React.ReactNode;
}

export function PriceText({ variant = "default", className, children, ...props }: PriceTextProps) {
    return (
        <span
            className={cn(
                "text-lg font-display font-normal italic text-primary whitespace-nowrap",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
