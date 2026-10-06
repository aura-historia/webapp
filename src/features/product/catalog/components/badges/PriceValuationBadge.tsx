import { useTranslation } from "react-i18next";

export function PriceValuationBadge({ type }: { readonly type: "CURRENT" | "SALE_OBSERVATION" }) {
    const { t } = useTranslation();
    if (type !== "SALE_OBSERVATION") return null;

    return (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("product.saleObservationPrice")}
        </span>
    );
}
