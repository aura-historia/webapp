import * as React from "react";
import { cn } from "@/lib/utils";
import type { Badge } from "@/components/ui/badge";

const Timeline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />,
);
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<HTMLDivElement, React.LiHTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("group relative pb-8 pl-8 sm:pl-28", className)} {...props} />
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
            "mb-1 flex flex-col items-start",
            "before:absolute before:left-2 before:h-full before:-translate-x-1/2 before:translate-y-3 before:self-start before:bg-primary/30 before:w-0.5",
            "after:absolute after:left-2 after:h-6 after:w-6 after:-translate-x-1/2 after:translate-y-0.5 after:rounded-full after:bg-primary/10",
            "group-last:before:hidden sm:flex-row sm:before:left-0 sm:before:ml-[6.5rem] sm:after:left-0 sm:after:ml-[6.5rem]",
            className,
        )}
        {...props}
    >
        <div className="absolute left-2 -translate-x-1/2 translate-y-1.5 h-5 w-5 rounded-full bg-primary/40 sm:left-0 sm:ml-[6.5rem]" />
        <div className="absolute left-2 -translate-x-1/2 translate-y-2.5 h-3 w-3 rounded-full bg-primary sm:left-0 sm:ml-[6.5rem]" />
        <div className="group-first:block hidden absolute left-2 -translate-x-1/2 translate-y-1.5 h-5 w-5 rounded-full bg-primary/50 sm:left-0 sm:ml-[6.5rem] animate-[ping_2.0s_cubic-bezier(0,0,0.2,1)_infinite]" />
        {props.children}
    </div>
));
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-lg font-semibold sm:ml-3", className)} {...props}>
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
                "mb-3 flex  flex-col gap-0.5 items-start text-sm font-semibold uppercase sm:absolute sm:mb-0 sm:left-0 sm:ml-[6rem] sm:-translate-x-full sm:translate-y-1.5 sm:pr-4 sm:w-auto sm:text-right",
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
        <div
            ref={ref}
            className={cn("text-sm sm:ml-3 text-muted-foreground", className)}
            {...props}
        />
    ),
);
TimelineDescription.displayName = "TimelineDescription";

export { Timeline, TimelineItem, TimelineHeader, TimelineTime, TimelineTitle, TimelineDescription };
