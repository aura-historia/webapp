import { cn } from "@/lib/utils";
import type React from "react";

export interface OlProps extends React.HTMLAttributes<HTMLOListElement> {
    readonly children: React.ReactNode;
}

export function Ol({ className, children, ...props }: OlProps) {
    return (
        <ol className={cn("list-decimal pl-6 space-y-1", className)} {...props}>
            {children}
        </ol>
    );
}
