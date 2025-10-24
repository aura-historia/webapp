import * as React from "react";
import { cn } from "@/lib/utils";
import type { Badge } from "@/components/ui/badge";

const Timeline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />,
);
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<HTMLDivElement, React.LiHTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("group relative pb-8 pl-28", className)} {...props} />
    ),
);
TimelineItem.displayName = "TimelineItem";

const TimelineHeader = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "mb-1 flex flex-row items-start",
            "before:absolute before:left-0 before:ml-[6.5rem] before:h-full before:-translate-x-1/2 before:translate-y-3 before:self-start before:bg-primary/30 before:w-0.5",
            "after:absolute after:left-0 after:ml-[6.5rem] after:h-6 after:w-6 after:-translate-x-1/2 after:translate-y-0.5 after:rounded-full after:bg-primary/10",
            "group-last:before:hidden",
            className,
        )}
        {...props}
    >
        <div className="absolute left-0 ml-[6.5rem] -translate-x-1/2 translate-y-1.5 h-5 w-5 rounded-full bg-primary/40" />
        <div className="absolute left-0 ml-[6.5rem] -translate-x-1/2 translate-y-2.5 h-3 w-3 rounded-full bg-primary" />
        <div className="group-first:block hidden absolute left-0 ml-[6.5rem] -translate-x-1/2 translate-y-1.5 h-5 w-5 rounded-full bg-primary/50 animate-[ping_2.0s_cubic-bezier(0,0,0.2,1)_infinite]" />
        {props.children}
    </div>
));
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-lg font-semibold ml-3", className)} {...props}>
            {children}
        </div>
    ),
);
TimelineTitle.displayName = "TimelineTitle";

const TimelineTime = ({
    className,
    variant = "outline",
    ...props
}: React.ComponentProps<typeof Badge>) => {
    return (
        <span
            className={cn(
                "absolute mb-0 left-0 ml-[6rem] -translate-x-full translate-y-1.5 pr-4 w-auto text-right flex flex-col gap-0.5 items-end text-sm font-semibold uppercase",
                className,
            )}
            {...props}
        >
            {props.children}
        </span>
    );
};
const TimelineDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm ml-3 text-muted-foreground", className)} {...props} />
    ),
);
TimelineDescription.displayName = "TimelineDescription";

export { Timeline, TimelineItem, TimelineHeader, TimelineTime, TimelineTitle, TimelineDescription };
