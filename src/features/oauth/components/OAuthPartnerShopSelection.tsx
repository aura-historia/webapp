import { useTranslation } from "react-i18next";
import type { OAuthPartnerShop } from "@/features/oauth/hooks/useOAuthPartnerShops.ts";

interface OAuthPartnerShopSelectionProps {
    readonly partnerShops: readonly OAuthPartnerShop[];
    readonly selectedPartnerShopId: string | undefined;
    readonly onSelectPartnerShop: (partnerShopId: string) => void;
}

export function OAuthPartnerShopSelection({
    partnerShops,
    selectedPartnerShopId,
    onSelectPartnerShop,
}: OAuthPartnerShopSelectionProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-primary">
                    {t("oauth.authorize.partnerShops.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                    {t("oauth.authorize.partnerShops.description")}
                </p>
            </div>

            <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">{t("oauth.authorize.partnerShops.title")}</legend>
                {partnerShops.map((shop) => (
                    <label key={shop.shopId} className="cursor-pointer">
                        <input
                            type="radio"
                            name="partner_shop_selection"
                            value={shop.shopId}
                            checked={selectedPartnerShopId === shop.shopId}
                            onChange={() => onSelectPartnerShop(shop.shopId)}
                            className="peer sr-only"
                        />
                        <div className="rounded-sm border border-outline-variant/20 p-3 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-xs text-muted-foreground">{shop.shopId}</p>
                        </div>
                    </label>
                ))}
            </fieldset>
        </div>
    );
}
