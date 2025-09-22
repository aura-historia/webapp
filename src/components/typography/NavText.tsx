import { cn } from "@/lib/utils";
import type React from "react";

interface NavTextProps extends React.HTMLAttributes<HTMLSpanElement> {
    readonly variant?: "default" | "muted" | "header" | "footer";
    readonly children: React.ReactNode;
}

export function NavText({ variant = "default", className, children, ...props }: NavTextProps) {
    return (
        <span
            className={cn(
                "text-xl font-semibold",
                variant === "muted" && "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
