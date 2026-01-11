import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
    const isLoading = useRouterState({ select: (s) => s.isLoading });
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let progressInterval: ReturnType<typeof setInterval> | undefined;
        let hideTimeout: ReturnType<typeof setTimeout> | undefined;

        if (isLoading) {
            setProgress(0);
            setVisible(true);

            // Simulate progress - starts fast, slows down as it approaches 90%
            progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        return prev;
                    }
                    // Slow down as we get closer to 90%
                    const increment = Math.max(1, (90 - prev) * 0.1);
                    return Math.min(90, prev + increment);
                });
            }, 100);
        } else if (visible) {
            setProgress(100);

            // Hide after animation completes
            hideTimeout = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
        }

        return () => {
            if (progressInterval) clearInterval(progressInterval);
            if (hideTimeout) clearTimeout(hideTimeout);
        };
    }, [isLoading, visible]);

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-100 h-1 bg-transparent pointer-events-none">
            <div
                className={cn(
                    "h-full bg-primary transition-all duration-200 ease-out",
                    progress === 100 && "opacity-0 transition-opacity duration-300",
                )}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
