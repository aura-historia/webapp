import { useTranslation } from "react-i18next";
import { ProviderStatusInfo } from "@/features/provider-status/components/ProviderStatusInfo.tsx";
import {
    buildRemovalMailto,
    displayHost,
    type ProviderStatusScope,
} from "@/features/provider-status/lib/providerStatusLinks.ts";
import { cn } from "@/lib/utils.ts";

type NonPartnerNoticeProps = {
    readonly scope: ProviderStatusScope;
    readonly providerName: string;
    /** The provider's canonical address (`url`, not the referral-tagged `viewUrl`). */
    readonly sourceUrl?: URL | string;
    /** Absolute address of this Aura Historia page, for the removal request. */
    readonly pageUrl?: string;
    /** Listing pages: whether the shown title or description is a machine translation. */
    readonly translated?: boolean;
    readonly className?: string;
};

/**
 * Always-visible notice on a non-partner listing or provider page, under the provider line: not a
 * partner, found automatically, whose rights the texts and images are, and a removal request. The ⓘ
 * adds the details. Copy follows the legal review of #1323 (see the Redesign's "Provider status"
 * boards); partners show the {@link PartnerBadge} instead.
 */
export function NonPartnerNotice({
    scope,
    providerName,
    sourceUrl,
    pageUrl,
    translated = false,
    className,
}: NonPartnerNoticeProps) {
    const { t } = useTranslation();
    const body =
        scope === "provider"
            ? t("providerStatus.notice.provider")
            : translated
              ? t("providerStatus.notice.listingTranslated", { provider: providerName })
              : t("providerStatus.notice.listing", { provider: providerName });
    const removalHref = buildRemovalMailto(t, { scope, providerName, pageUrl: pageUrl ?? "" });
    const sourceHref = sourceUrl?.toString();

    return (
        <aside
            aria-label={t("providerStatus.notice.label")}
            data-testid="non-partner-notice"
            className={cn(
                "flex items-start gap-3 rounded-lg p-3 shadow-[inset_0_0_0_1px_var(--color-line)] sm:py-3.5 sm:pr-4 sm:pl-3.5",
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill text-ink-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)]"
            >
                <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 10h16l-1.5-5h-13z" />
                    <path d="M5 10v9h14v-9" />
                    <path d="M10 19v-5h4v5" />
                </svg>
            </span>
            <p className="min-w-0 flex-1 pt-[5px] text-meta leading-[1.55] text-pretty text-ink-secondary sm:text-body-sm sm:leading-[1.55]">
                <strong className="font-semibold text-ink">
                    {t("providerStatus.notice.lead")}
                </strong>{" "}
                {body}{" "}
                <a
                    href={removalHref}
                    className="whitespace-nowrap text-ink underline decoration-line-strong decoration-1 underline-offset-3 hover:text-oxblood hover:decoration-oxblood focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass"
                >
                    {t("providerStatus.notice.removal")}
                </a>
            </p>
            <span className="shrink-0 pt-[5px] pr-0.5">
                <ProviderStatusInfo
                    scope={scope}
                    providerName={providerName}
                    sourceUrl={sourceHref}
                    sourceHost={displayHost(sourceHref)}
                    removalHref={removalHref}
                />
            </span>
        </aside>
    );
}
