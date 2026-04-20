import { Button } from "@/components/ui/button.tsx";
import { HeartIcon } from "lucide-react";
import {
    useWatchlistMutation,
    type WatchlistMutationType,
} from "@/hooks/watchlist/useWatchlistMutation.ts";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils.ts";

interface WatchlistButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly isWatching: boolean;
    readonly className?: string;
    readonly label?: string;
    readonly showIcon?: boolean;
}

export function WatchlistButton({
    shopId,
    shopsProductId,
    isWatching,
    className,
    label,
    showIcon = true,
    ...buttonProps
}: WatchlistButtonProps) {
    const watchlistMutation = useWatchlistMutation(shopId, shopsProductId);

    const mutationType: WatchlistMutationType = isWatching
        ? "deleteFromWatchlist"
        : "addToWatchlist";

    return (
        <Button
            {...buttonProps}
            className={cn("shrink-0", !label && "ml-auto", className)}
            onClick={() => {
                if (watchlistMutation.isPending) return;
                watchlistMutation.mutate(mutationType);
            }}
        >
            {showIcon && (
                <HeartIcon
                    className={`size-5 transition-all duration-300 ease-in-out ${
                        isWatching ? "fill-primary text-primary" : "fill-transparent"
                    } ${watchlistMutation.isPending ? "animate-heart-bounce" : ""}`}
                />
            )}
            {label && <span>{label}</span>}
        </Button>
    );
}
