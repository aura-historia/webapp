import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import prohibitedPlaceholder from "@/assets/images/prohibited-content-placeholder.svg";

interface ProhibitedImagePlaceholderProps {
    readonly className?: string;
    readonly showLabel?: boolean;
}

/**
 * Placeholder displayed when a product image URL is omitted
 * because the image contains prohibited content (e.g. symbols
 * covered by German StGB §86a) and the user has not consented
 * to viewing such content.
 */
export function ProhibitedImagePlaceholder({
    className,
    showLabel = true,
}: ProhibitedImagePlaceholderProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn("bg-muted flex flex-col items-center justify-center gap-2", className)}
            role="img"
            aria-label={t("product.prohibitedImage")}
            data-testid="prohibited-image-placeholder"
        >
            <img
                src={prohibitedPlaceholder}
                alt=""
                className="w-16 h-16 opacity-60"
                aria-hidden="true"
            />
            {showLabel && (
                <p className="text-xs text-muted-foreground text-center px-2">
                    {t("product.prohibitedImage")}
                </p>
            )}
        </div>
    );
}
