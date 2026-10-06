import { useTranslation } from "react-i18next";
import type { OAuthListingSource } from "@/features/oauth/hooks/useOAuthListingSources.ts";

interface OAuthListingSourceSelectionProps {
    readonly listingSources: readonly OAuthListingSource[];
    readonly selectedListingSourceId: string | undefined;
    readonly onSelectListingSource: (listingSourceId: string) => void;
}

export function OAuthListingSourceSelection({
    listingSources,
    selectedListingSourceId,
    onSelectListingSource,
}: OAuthListingSourceSelectionProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-primary">
                    {t("oauth.authorize.listingSources.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                    {t("oauth.authorize.listingSources.description")}
                </p>
            </div>

            <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">{t("oauth.authorize.listingSources.title")}</legend>
                {listingSources.map((shop) => {
                    const labelId = `listing-source-option-${shop.listingSourceId}`;

                    return (
                        <label key={shop.listingSourceId} className="cursor-pointer">
                            <input
                                type="radio"
                                name="listing_source_selection"
                                value={shop.listingSourceId}
                                checked={selectedListingSourceId === shop.listingSourceId}
                                onChange={() => onSelectListingSource(shop.listingSourceId)}
                                aria-labelledby={labelId}
                                className="peer sr-only"
                            />
                            <div className="rounded-sm border border-outline-variant/20 p-3 transition-colors peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                                <p id={labelId} className="font-medium">
                                    {shop.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {shop.listingSourceId}
                                </p>
                            </div>
                        </label>
                    );
                })}
            </fieldset>
        </div>
    );
}
