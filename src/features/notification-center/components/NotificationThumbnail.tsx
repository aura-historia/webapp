import { ImageIcon, ImageOff, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type NotificationPayload,
    isProductNotification,
} from "@/data/internal/notification/Notification.ts";
import { isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { HATCHED_PLACEHOLDER_CLASS } from "@/features/landing/components/common/ObjectCard.tsx";
import { cn } from "@/lib/utils.ts";

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter((part) => /\p{L}/u.test(part))
        .slice(0, 2)
        .map((part) => part.match(/\p{L}/u)?.[0]?.toUpperCase() ?? "")
        .join("");
}

/**
 * Square image of a notification: the listing photo, a shield when sensitive content is hidden, a
 * hatched placeholder without a photo, and for partner applications the dealer logo or initials.
 */
export function NotificationThumbnail({
    payload,
    className,
}: {
    readonly payload: NotificationPayload;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const { data: userAccount } = useUserAccount();
    const [failed, setFailed] = useState(false);
    const consentGiven = userAccount?.showUnassessedOrSensitiveContent ?? false;
    const base = cn("shrink-0 overflow-hidden rounded-md bg-image-ground", className);

    if (!isProductNotification(payload)) {
        if (payload.image && !failed) {
            return (
                <div className={cn(base, "bg-surface-raised p-1.5 shadow-ring")} aria-hidden="true">
                    <img
                        src={payload.image}
                        alt=""
                        loading="lazy"
                        onError={() => setFailed(true)}
                        className="size-full object-contain"
                    />
                </div>
            );
        }
        return (
            <div
                aria-hidden="true"
                className={cn(
                    base,
                    "flex items-center justify-center bg-oxblood font-serif text-on-oxblood",
                )}
            >
                {initials(payload.listingSourceName)}
            </div>
        );
    }

    if (payload.image && isRestrictedImage(payload.image, consentGiven)) {
        return (
            <div
                role="img"
                aria-label={t("product.prohibitedImage")}
                data-testid="prohibited-image-placeholder"
                className={cn(
                    base,
                    "flex items-center justify-center bg-surface-sunken text-oxblood shadow-[inset_0_0_0_1px_var(--line-subtle)]",
                )}
            >
                <ShieldAlert aria-hidden="true" className="size-[40%] max-w-6" strokeWidth={1.8} />
            </div>
        );
    }

    if (payload.image?.url && !failed) {
        return (
            <div className={base} aria-hidden="true">
                <img
                    src={payload.image.url.href}
                    alt=""
                    loading="lazy"
                    onError={() => setFailed(true)}
                    className="size-full object-cover"
                />
            </div>
        );
    }

    const Icon = failed ? ImageOff : ImageIcon;
    return (
        <div
            aria-hidden="true"
            className={cn(base, "flex items-center justify-center", HATCHED_PLACEHOLDER_CLASS)}
        >
            <Icon className="size-[40%] max-w-6" strokeWidth={1.4} />
        </div>
    );
}
