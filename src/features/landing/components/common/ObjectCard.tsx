import { ImageIcon, ShieldAlert } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProductListing } from "@/data/internal/product/ProductListing.ts";
import { isRestrictedImage } from "@/data/internal/product/ProductImageData.ts";
import { ProductListingLink } from "@/features/product/catalog/components/ProductListingLink.tsx";
import { cn } from "@/lib/utils.ts";

/** Hatched ground behind a missing or hidden object photo. */
export const HATCHED_PLACEHOLDER_CLASS =
    "bg-[repeating-linear-gradient(135deg,#e9e1d3_0_12px,#e3d9c9_12px_24px)] text-ink-muted";

function ImagePlaceholder({
    label,
    restricted,
}: {
    readonly label: string;
    readonly restricted?: boolean;
}) {
    const Icon = restricted ? ShieldAlert : ImageIcon;
    return (
        <div
            className={cn(
                "flex size-full flex-col items-center justify-center gap-2.5 px-4 text-center",
                HATCHED_PLACEHOLDER_CLASS,
            )}
        >
            <Icon aria-hidden="true" className="size-7" strokeWidth={1.4} />
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase">[{label}]</span>
        </div>
    );
}

interface ObjectCardProps {
    readonly product: ProductListing;
    readonly className?: string;
}

/**
 * One antique as it appears in the index, in the `rail` layout: 4:5 photo with an auction
 * badge for auction lots, serif title, source · country and price.
 */
export function ObjectCard({ product, className }: ObjectCardProps) {
    const { t } = useTranslation();
    const [imageFailed, setImageFailed] = useState(false);
    const image = product.images[0];
    const showSensitiveContent =
        product.userState?.contentVisibility.showUnassessedOrSensitiveContent ?? false;
    const isRestricted = image !== undefined && isRestrictedImage(image, showSensitiveContent);
    const title = product.title ?? t("product.untitled");
    const price =
        product.formattedPrice ??
        (product.price?.type === "ON_REQUEST"
            ? t("product.history.values.onRequest")
            : t("product.unknownPrice"));
    const seller = [product.source.name, product.geography?.country].filter(Boolean).join(" · ");

    let media: ReactNode;
    if (!image || imageFailed) {
        media = <ImagePlaceholder label={t("product.noImage")} />;
    } else if (isRestricted) {
        media = <ImagePlaceholder label={t("product.prohibitedImage")} restricted />;
    } else {
        media = (
            <img
                src={image.url?.href}
                alt={title}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
                className="size-full object-cover"
            />
        );
    }

    return (
        <article className={cn("min-w-0", className)}>
            <ProductListingLink
                productListingTitleSlugId={product.productListingTitleSlugId}
                className="group flex flex-col gap-3 rounded-field text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass sm:gap-3.5"
            >
                <div className="relative aspect-4/5 overflow-hidden rounded-field bg-image-ground">
                    {media}
                    {product.auctionId && (
                        <span className="absolute top-2.5 left-2.5 rounded-sm bg-chip-on-image px-[7px] py-[3px] font-mono text-tag text-ink uppercase">
                            {t("landingPage.latest.auctionBadge")}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-1.5">
                    <span className="line-clamp-2 font-serif text-[17px] leading-[1.25] group-hover:underline group-hover:underline-offset-3 sm:text-object-title">
                        {title}
                    </span>
                    <div className="flex items-baseline justify-between gap-3 text-xs text-ink-muted sm:text-meta">
                        <span className="min-w-0 truncate">{seller}</span>
                        <strong className="shrink-0 text-sm font-semibold whitespace-nowrap text-ink sm:text-price">
                            {price}
                        </strong>
                    </div>
                </div>
            </ProductListingLink>
        </article>
    );
}
