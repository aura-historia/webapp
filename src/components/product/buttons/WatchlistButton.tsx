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
}

export function WatchlistButton({
    shopId,
    shopsProductId,
    isWatching,
    className,
    ...buttonProps
}: WatchlistButtonProps) {
    const watchlistMutation = useWatchlistMutation(shopId, shopsProductId);

    const mutationType: WatchlistMutationType = isWatching
        ? "deleteFromWatchlist"
        : "addToWatchlist";

    return (
        <Button
            {...buttonProps}
            className={cn("ml-auto shrink-0", className)}
            onClick={() => {
                if (watchlistMutation.isPending) return;
                watchlistMutation.mutate(mutationType);
            }}
        >
            <HeartIcon
                className={`size-5 transition-all duration-300 ease-in-out ${
                    isWatching ? "fill-heart text-heart" : "fill-transparent"
                } ${watchlistMutation.isPending ? "animate-heart-bounce" : ""}`}
            />
        </Button>
    );
}
