import { useTranslation } from "react-i18next";
import type { OAuthPartnerShop } from "@/features/oauth/hooks/useOAuthPartnerShops.ts";

interface OAuthSelectedPartnerShopConfirmationProps {
    readonly partnerShop: OAuthPartnerShop;
}

export function OAuthSelectedPartnerShopConfirmation({
    partnerShop,
}: OAuthSelectedPartnerShopConfirmationProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
            <p className="text-xs font-medium text-muted-foreground">
                {t("oauth.authorize.partnerShops.selectedLabel")}
            </p>
            <p className="mt-1 text-sm font-medium">{partnerShop.name}</p>
        </div>
    );
}
