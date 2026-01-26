import { cn } from "@/lib/utils";
import type React from "react";

export interface UlProps extends React.HTMLAttributes<HTMLUListElement> {
    readonly children: React.ReactNode;
}

export function Ul({ className, children, ...props }: UlProps) {
    return (
        <ul className={cn("list-disc pl-6 space-y-1", className)} {...props}>
            {children}
        </ul>
    );
}
