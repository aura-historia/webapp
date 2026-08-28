import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { LocationSection } from "@/features/location-display/components/LocationSection.tsx";
import { useTranslation } from "react-i18next";

type ShopLocationSectionProps = {
    readonly shop: ShopDetail;
};

export function ShopLocationSection({ shop }: ShopLocationSectionProps) {
    const { t } = useTranslation();

    const shopTypeName = shop.shopType
        ? t(SHOP_TYPE_TRANSLATION_CONFIG[shop.shopType].translationKey)
        : t("shop.typeFallback");
    const shopTypeArticle = shop.shopType
        ? t(SHOP_TYPE_TRANSLATION_CONFIG[shop.shopType].articleTranslationKey)
        : t("shop.typeArticleFallback");

    return (
        <LocationSection
            className="mx-auto w-full max-w-7xl px-4 pb-14 md:px-10 md:pb-18"
            texts={{
                eyebrow: t("shop.location.eyebrow"),
                title: t("shop.location.title", { shopTypeArticle }),
                description: t("shop.location.description", {
                    shop: shop.name,
                    shopType: shopTypeName,
                }),
                noAddress: t("shop.location.noAddress", { shopTypeArticle }),
                noLocation: t("shop.location.noLocation", { shopTypeArticle }),
                mapTitle: t("shop.location.mapTitle", { shop: shop.name }),
                mapConsentTitle: t("shop.location.mapConsentTitle"),
                mapConsentDescription: t("shop.location.mapConsentDescription"),
                mapConsentButton: t("shop.location.mapConsentButton"),
                mapConsentSettings: t("shop.location.mapConsentSettings"),
            }}
            structuredAddress={shop.structuredAddress}
            geoAddress={shop.geoAddress}
            contact={
                shop.email || shop.phone
                    ? {
                          eyebrow: t("shop.contact.eyebrow"),
                          emailLabel: t("shop.contact.email"),
                          phoneLabel: t("shop.contact.phone"),
                          email: shop.email,
                          phone: shop.phone,
                      }
                    : undefined
            }
        />
    );
}
