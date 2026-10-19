import { Button } from "@/components/ui/button.tsx";
import { useWatchlistNotificationMutation } from "@/features/watchlist/api/useWatchlistNotificationMutation.ts";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils.ts";
import { ToggleBellIcon } from "@/components/common/ToggleBellIcon.tsx";

interface NotificationButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
    readonly productListingId: string;
    readonly isNotificationEnabled: boolean;
    readonly className?: string;
    readonly isVisible?: boolean;
}

export function NotificationButton({
    productListingId,
    isNotificationEnabled,
    className,
    isVisible = true,
    ...buttonProps
}: NotificationButtonProps) {
    const watchlistNotificationMutation = useWatchlistNotificationMutation(productListingId);

    return (
        <Button
            {...buttonProps}
            className={cn(
                "ml-auto shrink-0 transition-opacity duration-300 ease-out",
                isVisible ? "opacity-100" : "pointer-events-none opacity-0",
                className,
            )}
            onClick={() => {
                if (watchlistNotificationMutation.isPending) return;
                watchlistNotificationMutation.mutate(!isNotificationEnabled);
            }}
            disabled={watchlistNotificationMutation.isPending || !isVisible}
        >
            <ToggleBellIcon
                on={isNotificationEnabled}
                className="size-5"
                filledClassName="fill-primary"
                strokeWidth={2}
            />
        </Button>
    );
}
