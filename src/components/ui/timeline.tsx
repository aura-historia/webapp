import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A vertical timeline: a mono date column, a hairline with dots, and the entry text.
 * The first entry is the newest; its dot is oxblood and its title is bold.
 */
const Timeline = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
    ({ className, ...props }, ref) => (
        <ol ref={ref} className={cn("m-0 list-none p-0", className)} {...props} />
    ),
);
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
    ({ className, ...props }, ref) => (
        <li
            ref={ref}
            className={cn(
                "group relative flex flex-col gap-1.5 py-[18px] pl-7 sm:pl-32",
                // the hairline joining the dots, from the first dot to the last
                "before:absolute before:top-0 before:bottom-0 before:left-[7.5px] before:w-px before:bg-line sm:before:left-[103.5px]",
                "first:before:top-7 last:before:bottom-[calc(100%-28px)]",
                // the divider under each entry's text
                "after:absolute after:right-0 after:bottom-0 after:left-7 after:h-px after:bg-line-subtle sm:after:left-32",
                className,
            )}
            {...props}
        />
    ),
);
TimelineItem.displayName = "TimelineItem";

const TimelineHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1",
                className,
            )}
            {...props}
        >
            <span
                aria-hidden="true"
                className="absolute top-[22px] left-0.5 size-[11px] rounded-pill bg-surface shadow-[inset_0_0_0_1.5px_var(--color-ink-muted)] group-first:bg-oxblood group-first:shadow-[0_0_0_4px_rgba(74,21,32,0.14)] sm:left-[98px]"
            />
            {children}
        </div>
    ),
);
TimelineHeader.displayName = "TimelineHeader";

const TimelineTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-body leading-[1.4] font-medium text-ink group-first:font-semibold",
            className,
        )}
        {...props}
    >
        {children}
    </h3>
));
TimelineTitle.displayName = "TimelineTitle";

/** Date and time; a left column from 640px, beside the title on phones. */
const TimelineTime = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span
        className={cn(
            "order-last flex shrink-0 gap-1 font-mono text-tag leading-[1.3] tracking-[0.1em] text-ink-muted uppercase sm:absolute sm:top-5 sm:left-0 sm:w-[84px] sm:flex-col sm:gap-[3px] [&>:first-child]:text-ink",
            className,
        )}
        {...props}
    />
);

const TimelineDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-body-sm leading-[1.5] text-ink-secondary", className)}
        {...props}
    />
));
TimelineDescription.displayName = "TimelineDescription";

export { Timeline, TimelineItem, TimelineHeader, TimelineTime, TimelineTitle, TimelineDescription };
