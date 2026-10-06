import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { ShieldAlert } from "lucide-react";

interface ProhibitedImagePlaceholderProps {
    readonly className?: string;
    readonly showLabel?: boolean;
}

/**
 * Placeholder for redacted images or unassessed/sensitive content
 * hidden by the account visibility preference.
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
            <ShieldAlert className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
            {showLabel && (
                <p className="text-sm text-muted-foreground text-center px-2">
                    {t("product.prohibitedImage")}
                </p>
            )}
        </div>
    );
}
