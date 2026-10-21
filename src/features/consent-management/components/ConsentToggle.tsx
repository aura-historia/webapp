import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * The design system's Toggle: a 34 × 20 pill, oxblood when on, inside a 44px hit area
 * (design board "Legal · Cookie settings — switch states & saving").
 */
export function ConsentToggle({
    className,
    ...props
}: ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            className={cn(
                "group inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-pill outline-none disabled:cursor-not-allowed disabled:opacity-35",
                className,
            )}
            {...props}
        >
            <span className="relative h-5 w-[34px] rounded-pill bg-line-strong transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-3 group-focus-visible:outline-brass group-data-[state=checked]:bg-oxblood motion-reduce:transition-none">
                <SwitchPrimitive.Thumb className="absolute top-[3px] left-[3px] block size-3.5 rounded-full bg-on-oxblood transition-transform duration-150 data-[state=checked]:translate-x-3.5 motion-reduce:transition-none" />
            </span>
        </SwitchPrimitive.Root>
    );
}
