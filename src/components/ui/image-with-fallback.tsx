import { ImageOff } from "lucide-react";
import { type ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";

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
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);
    const currentSrcRef = useRef<string | undefined>(src);

    // Reset error state when src changes
    useEffect(() => {
        if (src !== currentSrcRef.current) {
            setHasError(false);
            setIsLoading(true);
            currentSrcRef.current = src;
        }

        // Check if the image is already in error state (e.g., after page refresh)
        if (imgRef.current?.complete && imgRef.current.naturalWidth === 0 && src) {
            setHasError(true);
            setIsLoading(false);
        } else if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
            setIsLoading(false);
        }
    }, [src]);

    if (isLoading && src) {
        return (
            <div className={cn("relative", className)}>
                <Skeleton
                    className={cn("absolute inset-0", fallbackClassName)}
                    role="status"
                    aria-label="Loading image"
                />
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className={cn("opacity-0", className)}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    {...props}
                />
            </div>
        );
    }

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
            ref={imgRef}
            src={src}
            alt={alt}
            className={className}
            onLoad={() => setIsLoading(false)}
            onError={() => {
                setIsLoading(false);
                setHasError(true);
            }}
            {...props}
        />
    );
}
