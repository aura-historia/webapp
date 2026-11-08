import { useTranslation } from "react-i18next";
import type { OAuthListingSource } from "@/features/oauth/hooks/useOAuthListingSources.ts";
import { CONSENT_HEADING_CLASS } from "@/features/oauth/lib/oauthConsentStyles.ts";
import type { OwnListingSourcesPaging } from "@/features/partner/common/api/useOwnListingSources.ts";
import { OwnListingSourcesMore } from "@/features/partner/common/components/OwnListingSourcesMore.tsx";
import { cn } from "@/lib/utils.ts";

interface OAuthListingSourceSelectionProps {
    readonly listingSources: readonly OAuthListingSource[];
    /** Paging state of the shared granted-source read. */
    readonly listingSourcePages: OwnListingSourcesPaging;
    readonly selectedListingSourceId: string | undefined;
    readonly onSelectListingSource: (listingSourceId: string) => void;
    /** A line under the description, e.g. which provider the recipient expects. */
    readonly hint?: string;
}

/** The selected option: raised on an oxblood wash with the selection ring. */
export const SOURCE_OPTION_CLASS =
    "grid min-h-14 grid-cols-[20px_minmax(0,1fr)] items-center gap-3 rounded-md px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line)]";
export const SOURCE_OPTION_SELECTED_CLASS =
    "bg-[color-mix(in_srgb,var(--oxblood)_6%,var(--surface-raised))] shadow-selected";

export function OAuthListingSourceSelection({
    listingSources,
    listingSourcePages,
    selectedListingSourceId,
    onSelectListingSource,
    hint,
}: OAuthListingSourceSelectionProps) {
    const { t } = useTranslation();

    return (
        <fieldset className="flex min-w-0 flex-col gap-3">
            <legend className={CONSENT_HEADING_CLASS}>
                {t("oauth.authorize.listingSources.title")}
            </legend>
            <div className="mt-1.5 flex flex-col gap-1">
                <p className="text-meta leading-[1.6] text-ink-secondary">
                    {t("oauth.authorize.listingSources.description")}
                </p>
                {hint && <p className="text-meta leading-[1.6] font-medium text-ink">{hint}</p>}
            </div>
            <div className="flex flex-col gap-2">
                {listingSources.map((shop) => {
                    const labelId = `listing-source-option-${shop.listingSourceId}`;
                    const selected = selectedListingSourceId === shop.listingSourceId;

                    return (
                        <label
                            key={shop.listingSourceId}
                            className={cn(
                                SOURCE_OPTION_CLASS,
                                "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass",
                                selected && SOURCE_OPTION_SELECTED_CLASS,
                            )}
                        >
                            <input
                                type="radio"
                                name="listing_source_selection"
                                value={shop.listingSourceId}
                                checked={selected}
                                onChange={() => onSelectListingSource(shop.listingSourceId)}
                                aria-labelledby={labelId}
                                className="m-0 size-[18px] accent-oxblood outline-none"
                            />
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <span
                                    id={labelId}
                                    className="text-[15px] leading-[1.4] font-medium text-ink"
                                >
                                    {shop.name}
                                </span>
                                <code className="font-mono text-xs leading-[1.4] break-all text-ink-muted">
                                    {shop.listingSourceId}
                                </code>
                            </span>
                        </label>
                    );
                })}
            </div>
            <OwnListingSourcesMore listingSources={listingSourcePages} />
        </fieldset>
    );
}
