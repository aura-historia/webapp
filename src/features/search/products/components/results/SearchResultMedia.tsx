import { ImageIcon, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isRestrictedImage, type ProductImage } from "@/data/internal/product/ProductImageData.ts";
import { HATCHED_PLACEHOLDER_CLASS } from "@/features/landing/components/common/ObjectCard.tsx";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { cn } from "@/lib/utils.ts";

function MediaPlaceholder({ restricted }: { readonly restricted?: boolean }) {
    const { t } = useTranslation();
    const Icon = restricted ? ShieldAlert : ImageIcon;
    return (
        <div
            className={cn(
                "flex size-full flex-col items-center justify-center gap-2.5 px-4 text-center",
                HATCHED_PLACEHOLDER_CLASS,
            )}
        >
            <Icon aria-hidden="true" className="size-7" strokeWidth={1.4} />
            <span className="font-mono text-tag tracking-[0.14em] uppercase">
                [{restricted ? t("product.prohibitedImage") : t("product.noImage")}]
            </span>
        </div>
    );
}

function MediaImage({
    image,
    showSensitiveContent,
}: {
    readonly image: ProductImage;
    readonly showSensitiveContent: boolean;
}) {
    const [failed, setFailed] = useState(false);
    if (isRestrictedImage(image, showSensitiveContent)) return <MediaPlaceholder restricted />;
    if (failed || !image.url?.href) return <MediaPlaceholder />;
    return (
        <img
            src={image.url.href}
            alt=""
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
            className="size-full object-cover"
        />
    );
}

type SearchResultMediaProps = {
    /** Collection reads return a listing's first image only; the detail page shows the gallery. */
    readonly image?: ProductImage;
    readonly productListingTitleSlugId?: string;
    readonly showSensitiveContent: boolean;
    readonly onProductClick?: () => void;
};

/** The square photo of a result: its first image, or a placeholder when it has none. */
export function SearchResultMedia({
    image,
    productListingTitleSlugId,
    showSensitiveContent,
    onProductClick,
}: SearchResultMediaProps) {
    return (
        <div aria-hidden="true" className="size-full">
            <ProductListingLink
                productListingTitleSlugId={productListingTitleSlugId}
                onClick={onProductClick}
                className="block size-full"
            >
                {image ? (
                    <MediaImage image={image} showSensitiveContent={showSensitiveContent} />
                ) : (
                    <MediaPlaceholder />
                )}
            </ProductListingLink>
        </div>
    );
}
