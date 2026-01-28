import { ImageOff } from "lucide-react";
import { type ImgHTMLAttributes, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
    readonly fallbackClassName?: string;
    readonly showErrorMessage?: boolean;
}

/**
 * Image component with error handling.
 * Shows a fallback UI when the image fails to load.
 */
export function ImageWithFallback({
    src,
    alt,
    className,
    fallbackClassName,
    showErrorMessage = true,
    ...props
}: ImageWithFallbackProps) {
    const { t } = useTranslation();
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
        return (
            <div
                className={cn(
                    "bg-muted flex flex-col items-center justify-center gap-2",
                    fallbackClassName,
                )}
                role="img"
                aria-label={alt || t("product.imageLoadError")}
            >
                <ImageOff className="w-12 h-12 text-muted-foreground" />
                {showErrorMessage && (
                    <p className="text-sm text-muted-foreground text-center px-2">
                        {t("product.imageLoadError")}
                    </p>
                )}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            {...props}
        />
    );
}
