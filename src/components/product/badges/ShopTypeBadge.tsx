import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { Gavel, ShoppingBag, Store } from "lucide-react";
import { type ShopType, SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { useTranslation } from "react-i18next";

interface ShopTypeBadgeProps {
    readonly shopType: ShopType;
    readonly className?: string;
}

const SHOP_TYPE_ICONS = {
    AUCTION_HOUSE: Gavel,
    AUCTION_PLATFORM: Gavel,
    COMMERCIAL_DEALER: Store,
    MARKETPLACE: ShoppingBag,
} as const;

export function ShopTypeBadge({ shopType, className }: ShopTypeBadgeProps) {
    const { t } = useTranslation();

    if (shopType === "UNKNOWN") return null;

    const Icon = SHOP_TYPE_ICONS[shopType];

    return (
        <Badge variant="secondary" className={cn("py-1 gap-1", className)}>
            <Icon className="size-3" />
            {t(SHOP_TYPE_TRANSLATION_CONFIG[shopType].translationKey)}
        </Badge>
    );
}
