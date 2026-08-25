import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { Handshake, Globe } from "lucide-react";
import {
    type ShopPartnerStatus,
    SHOP_PARTNER_STATUS_TRANSLATION_CONFIG,
} from "@/data/internal/shop/ShopPartnerStatus.ts";
import { useTranslation } from "react-i18next";

interface ShopPartnerStatusBadgeProps {
    readonly partnerStatus: ShopPartnerStatus;
    readonly className?: string;
}

const PARTNER_STATUS_ICONS = {
    PARTNERED: Handshake,
    SCRAPED: Globe,
} as const;

const PARTNER_STATUS_VARIANTS = {
    PARTNERED: "default",
    SCRAPED: "secondary",
} as const;

export function ShopPartnerStatusBadge({ partnerStatus, className }: ShopPartnerStatusBadgeProps) {
    const { t } = useTranslation();

    const Icon = PARTNER_STATUS_ICONS[partnerStatus];
    const variant = PARTNER_STATUS_VARIANTS[partnerStatus];

    return (
        <Badge variant={variant} className={cn("py-1 gap-1", className)}>
            <Icon className="size-3" />
            {t(SHOP_PARTNER_STATUS_TRANSLATION_CONFIG[partnerStatus].translationKey)}
        </Badge>
    );
}
