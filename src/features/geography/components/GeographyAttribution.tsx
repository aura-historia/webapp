import { ExternalLink } from "lucide-react";
import { Trans } from "react-i18next";
import {
    AMAZON_LOCATION_ATTRIBUTION,
    type GeographyAttribution as GeographyAttributionData,
} from "@/data/internal/geography/GeographyAttribution.ts";
import { cn } from "@/lib/utils.ts";

interface GeographyAttributionProps {
    /** Attribution supplied by the contract; defaults to the Amazon Location Service page. */
    readonly attribution?: GeographyAttributionData;
    readonly className?: string;
}

export function GeographyAttribution({
    attribution = AMAZON_LOCATION_ATTRIBUTION,
    className,
}: GeographyAttributionProps) {
    return (
        <p className={cn("text-xs text-muted-foreground", className)}>
            <Trans
                i18nKey="geography.attribution"
                values={{ provider: attribution.provider }}
                components={{
                    providerLink: (
                        <a
                            href={attribution.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                        >
                            {attribution.provider}
                        </a>
                    ),
                }}
            />
            <ExternalLink className="ml-1 inline size-3 align-baseline" aria-hidden="true" />
        </p>
    );
}
