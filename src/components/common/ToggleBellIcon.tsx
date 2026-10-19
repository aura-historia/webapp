import { Bell, BellRing } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";

/**
 * The notification bell of an alert toggle. When `on` changes it animates: a decaying swing as
 * alerts turn on, a small settle as they turn off. It never animates on its first render.
 */
export function ToggleBellIcon({
    on,
    className,
    filledClassName = "fill-current",
    strokeWidth = 1.8,
}: {
    readonly on: boolean;
    /** Size and colour of the icon. */
    readonly className?: string;
    /** Fill of the ringing bell. */
    readonly filledClassName?: string;
    readonly strokeWidth?: number;
}) {
    const [previous, setPrevious] = useState(on);
    const [toggled, setToggled] = useState(false);
    if (previous !== on) {
        setPrevious(on);
        setToggled(true);
    }

    return on ? (
        <BellRing
            key="on"
            aria-hidden="true"
            data-animated={toggled}
            strokeWidth={strokeWidth}
            className={cn(
                "origin-[50%_12%] motion-reduce:animate-none",
                filledClassName,
                toggled && "animate-bell-ring",
                className,
            )}
        />
    ) : (
        <Bell
            key="off"
            aria-hidden="true"
            data-animated={toggled}
            strokeWidth={strokeWidth}
            className={cn(
                "motion-reduce:animate-none",
                toggled && "animate-bell-settle",
                className,
            )}
        />
    );
}
