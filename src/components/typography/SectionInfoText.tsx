import { cn } from "@/lib/utils";
import type React from "react";

interface SectionInfoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    readonly variant?: "default" | "muted";
    readonly children: React.ReactNode;
}

export function SectionInfoText({
    variant = "default",
    className,
    children,
    ...props
}: SectionInfoTextProps) {
    return (
        <span
            className={cn(
                "text-lg font-medium",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
