import { cn } from "@/lib/utils";
import type React from "react";

export type LiProps = React.ComponentPropsWithoutRef<"li">;

export function Li({ className, children, ...props }: LiProps) {
    return (
        <li className={cn("leading-relaxed", className)} {...props}>
            {children}
        </li>
    );
}
