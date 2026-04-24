import * as React from "react";
import { cn } from "@/lib/utils.ts";

type StepperCtx = { value: number; onValueChange: (v: number) => void };
const StepperContext = React.createContext<StepperCtx>({ value: 1, onValueChange: () => {} });

type StepItemCtx = { step: number; state: "active" | "completed" | "inactive" };
const StepItemContext = React.createContext<StepItemCtx>({ step: 1, state: "inactive" });

type StepperProps = React.HTMLAttributes<HTMLDivElement> & {
    value: number;
    onValueChange?: (v: number) => void;
};

function Stepper({ value, onValueChange = () => {}, className, children, ...props }: StepperProps) {
    return (
        <StepperContext.Provider value={{ value, onValueChange }}>
            <div className={cn("flex flex-col gap-4", className)} {...props}>
                {children}
            </div>
        </StepperContext.Provider>
    );
}

function StepperNav({ className, children, ...props }: React.HTMLAttributes<HTMLOListElement>) {
    return (
        <ol className={cn("flex flex-row items-start", className)} {...props}>
            {children}
        </ol>
    );
}

type StepperItemProps = React.HTMLAttributes<HTMLLIElement> & { step: number };

function StepperItem({ step, className, children, ...props }: StepperItemProps) {
    const { value } = React.useContext(StepperContext);
    const state: StepItemCtx["state"] =
        value > step ? "completed" : value === step ? "active" : "inactive";
    return (
        <StepItemContext.Provider value={{ step, state }}>
            <li
                data-state={state}
                className={cn("group/step flex items-center", className)}
                {...props}
            >
                {children}
            </li>
        </StepItemContext.Provider>
    );
}

function StepperTrigger({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { onValueChange } = React.useContext(StepperContext);
    const { step, state } = React.useContext(StepItemContext);
    return (
        <button
            type="button"
            data-state={state}
            onClick={() => state === "completed" && onValueChange(step)}
            className={cn(
                "flex items-center gap-2",
                state === "completed" ? "cursor-pointer" : "cursor-default",
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

function StepperIndicator({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { state, step } = React.useContext(StepItemContext);
    return (
        <div
            data-state={state}
            className={cn(
                "flex shrink-0 items-center justify-center rounded-full border-2 size-8 text-sm font-medium transition-colors",
                state === "completed" && "border-primary bg-primary text-primary-foreground",
                state === "active" && "border-primary bg-background text-primary",
                state === "inactive" &&
                    "border-muted-foreground/30 bg-background text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children ?? step}
        </div>
    );
}

type StepperSeparatorProps = React.HTMLAttributes<HTMLDivElement> & { step?: number };

function StepperSeparator({ step, className, ...props }: StepperSeparatorProps) {
    const { value } = React.useContext(StepperContext);
    const itemCtx = React.useContext(StepItemContext);
    const isCompleted = step !== undefined ? value > step : itemCtx.state === "completed";
    return (
        <div
            className={cn(
                "h-px self-start transition-colors",
                isCompleted ? "bg-primary" : "bg-muted-foreground/30",
                className,
            )}
            {...props}
        />
    );
}

function StepperTitle({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
    const { state } = React.useContext(StepItemContext);
    return (
        <span
            data-state={state}
            className={cn(
                "text-xs font-medium leading-tight",
                state === "active"
                    ? "text-primary"
                    : state === "completed"
                      ? "text-foreground"
                      : "text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}

export {
    Stepper,
    StepperNav,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperSeparator,
    StepperTitle,
};
