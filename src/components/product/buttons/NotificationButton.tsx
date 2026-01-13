import { Button } from "@/components/ui/button.tsx";
import { Bell, BellRing } from "lucide-react";
import { useWatchlistNotificationMutation } from "@/hooks/watchlist/useWatchlistNotificationMutation.ts";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils.ts";

interface NotificationButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
    readonly shopId: string;
    readonly shopsProductId: string;
    readonly isNotificationEnabled: boolean;
    readonly className?: string;
}

export function NotificationButton({
    shopId,
    shopsProductId,
    isNotificationEnabled,
    className,
    ...buttonProps
}: NotificationButtonProps) {
    const watchlistNotificationMutation = useWatchlistNotificationMutation(shopId, shopsProductId);

    return (
        <Button
            {...buttonProps}
            className={cn("ml-auto shrink-0", className)}
            onClick={() => {
                if (watchlistNotificationMutation.isPending) return;
                watchlistNotificationMutation.mutate(!isNotificationEnabled);
            }}
            disabled={watchlistNotificationMutation.isPending}
        >
            <div className="relative size-5">
                <Bell
                    className={`absolute inset-0 size-5 transition-all duration-300 ease-in-out ${
                        isNotificationEnabled ? "opacity-0 scale-75" : "opacity-100 scale-100"
                    } ${watchlistNotificationMutation.isPending ? "animate-heart-bounce" : ""}`}
                />
                <BellRing
                    className={`absolute inset-0 size-5 transition-all duration-300 ease-in-out fill-foreground ${
                        isNotificationEnabled ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    } ${watchlistNotificationMutation.isPending ? "animate-heart-bounce" : ""}`}
                />
            </div>
        </Button>
    );
}
