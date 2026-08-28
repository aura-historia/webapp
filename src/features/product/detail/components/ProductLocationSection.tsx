import { useTranslation } from "react-i18next";
import type { GeoAddress, StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";
import { LocationSection } from "@/features/location-display/components/LocationSection.tsx";

type ProductLocationSectionProps = {
    readonly title: string;
    readonly structuredAddress?: StructuredAddress;
    readonly geoAddress?: GeoAddress;
};

export function ProductLocationSection({
    title,
    structuredAddress,
    geoAddress,
}: ProductLocationSectionProps) {
    const { t } = useTranslation();

    return (
        <LocationSection
            className="mt-16"
            texts={{
                eyebrow: t("product.location.eyebrow"),
                title: t("product.location.title"),
                description: t("product.location.description"),
                noAddress: t("product.location.noAddress"),
                noLocation: t("product.location.noLocation"),
                mapTitle: t("product.location.mapTitle", { title }),
                mapConsentTitle: t("product.location.mapConsentTitle"),
                mapConsentDescription: t("product.location.mapConsentDescription"),
                mapConsentButton: t("product.location.mapConsentButton"),
                mapConsentSettings: t("product.location.mapConsentSettings"),
            }}
            structuredAddress={structuredAddress}
            geoAddress={geoAddress}
        />
    );
}
