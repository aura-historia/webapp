import * as React from "react";
import { cn } from "@/lib/utils";
import type { Badge } from "@/components/ui/badge";

const Timeline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />,
);
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<HTMLDivElement, React.LiHTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("group relative pb-8 pl-8 sm:pl-44", className)} {...props} />
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
            "after:absolute after:left-2 after:h-7 after:w-7 after:-translate-x-1/2 after:translate-y-0.5 after:rounded-full after:bg-primary/10",
            "group-last:before:hidden sm:flex-row sm:before:left-0 sm:before:ml-[10rem] sm:after:left-0 sm:after:ml-[10rem]",
            className,
        )}
        {...props}
    >
        <div className="absolute left-2 -translate-x-1/2 translate-y-1.5 h-5 w-5 rounded-full bg-primary/40 sm:left-0 sm:ml-[10rem]" />
        <div className="absolute left-2 -translate-x-1/2 translate-y-2.5 h-3 w-3 rounded-full bg-primary sm:left-0 sm:ml-[10rem]" />
        <div className="group-first:block hidden absolute left-2 -translate-x-1/2 translate-y-1.5 h-5 w-5 rounded-full bg-primary/50 sm:left-0 sm:ml-[10rem] animate-[ping_2.0s_cubic-bezier(0,0,0.2,1)_infinite]" />
        {props.children}
    </div>
));
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("text-lg font-semibold", className)} {...props}>
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
                "left-0 pr-4 mb-3 inline-flex h-7 w-40 translate-y-0.5 items-center justify-center text-sm font-semibold uppercase sm:absolute sm:mb-0",
                className,
            )}
            {...props}
        >
            {props.children}
        </span>
    );
};
TimelineTime.displayName = "TimelineTime";

const TimelineDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("text-base text-muted-foreground", className)} {...props} />
    ),
);
TimelineDescription.displayName = "TimelineDescription";

export { Timeline, TimelineItem, TimelineHeader, TimelineTime, TimelineTitle, TimelineDescription };
