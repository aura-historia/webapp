import { Link } from "@tanstack/react-router";
import { ArrowRight, Copy, Info, Plus, Store } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import {
    type OwnListingSource,
    useOwnListingSources,
} from "@/features/partner/common/api/useOwnListingSources.ts";
import { OwnListingSourcesMore } from "@/features/partner/common/components/OwnListingSourcesMore.tsx";
import { PartnerPageHeader } from "@/features/partner/common/components/PartnerPageHeader.tsx";
import {
    PartnerListHeading,
    PartnerStatePanel,
} from "@/features/partner/common/components/PartnerStatePanel.tsx";
import {
    ICON_BUTTON_CLASS,
    SECONDARY_PILL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";

const GRID_CLASS = "grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]";

export function PartnerListingSourcesSection() {
    const { t } = useTranslation();
    const { isAuthenticated, isResolved } = useResolvedAuth();
    const listingSources = useOwnListingSources(isAuthenticated);
    const { sources, isPending, isError, hasMore, retry } = listingSources;

    let content: ReactNode;
    if (!isResolved || (isAuthenticated && isPending)) {
        content = <ProviderCardsSkeleton />;
    } else if (isError && isAuthenticated) {
        content = (
            <PartnerStatePanel
                tone="error"
                titleKey="partnerListingSources.loadErrorHeading"
                description={t("partnerListingSources.loadError")}
            >
                <button type="button" className={SECONDARY_PILL_CLASS} onClick={retry}>
                    {t("partnerDashboard.tryAgain")}
                </button>
            </PartnerStatePanel>
        );
    } else if (!isAuthenticated || (sources.length === 0 && !hasMore)) {
        content = (
            <PartnerStatePanel
                tone="empty"
                icon={Store}
                titleKey="partnerListingSources.emptyHeading"
                description={t("partnerListingSources.emptyDescription")}
            >
                <Link
                    to="/$lng/partners/applications"
                    params={true}
                    from="/$lng"
                    className={SECONDARY_PILL_CLASS}
                >
                    {t("partnerListingSources.viewApplications")}
                </Link>
            </PartnerStatePanel>
        );
    } else {
        content = (
            <>
                <section aria-labelledby="partner-providers-title" className="flex flex-col gap-5">
                    <PartnerListHeading
                        id="partner-providers-title"
                        title={t("partnerListingSources.withAccess")}
                        count={
                            hasMore
                                ? t("partnerListingSources.countIncomplete", {
                                      count: sources.length,
                                  })
                                : t("partnerListingSources.count", { count: sources.length })
                        }
                    />
                    <ul className={GRID_CLASS}>
                        {sources.map((source) => (
                            <ProviderCard key={source.listingSourceId} source={source} />
                        ))}
                    </ul>
                    <OwnListingSourcesMore
                        listingSources={listingSources}
                        className="gap-3 border-t border-line pt-5"
                        textClassName="text-body-sm text-ink-secondary"
                        buttonClassName={SECONDARY_PILL_CLASS}
                    />
                </section>
                <p className="flex max-w-[680px] items-start gap-3 text-meta text-ink-muted">
                    <Info
                        aria-hidden="true"
                        className="mt-0.5 size-[15px] shrink-0"
                        strokeWidth={1.8}
                    />
                    {t("partnerListingSources.accessNote")}
                </p>
            </>
        );
    }

    return (
        <>
            <PartnerPageHeader
                titleKey="partnerListingSources.heading"
                lead={t("partnerListingSources.lead")}
                action={
                    <Link
                        to="/$lng/partners/applications"
                        params={true}
                        from="/$lng"
                        search={{ create: true }}
                        className={SECONDARY_PILL_CLASS}
                    >
                        <Plus aria-hidden="true" className="size-4" strokeWidth={1.8} />
                        {t("partnerListingSources.applyForAnother")}
                    </Link>
                }
            />
            {content}
        </>
    );
}

function ProviderCard({ source }: { readonly source: OwnListingSource }) {
    const { t } = useTranslation();
    const copyId = async () => {
        if (!navigator.clipboard) return;
        await navigator.clipboard.writeText(source.listingSourceId);
        toast.success(t("partnerListingSources.idCopied"));
    };

    return (
        <li className="flex min-w-0 flex-col gap-4 rounded-panel bg-surface-raised p-5 shadow-ring">
            <div className="flex min-w-0 items-center gap-3.5">
                <span
                    aria-hidden="true"
                    className="inline-flex size-12 shrink-0 items-center justify-center rounded-thumb bg-image-ground font-serif text-[22px] text-ink-secondary shadow-ring"
                >
                    {source.name.trim().charAt(0).toUpperCase()}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate font-serif text-[21px] leading-[1.2] font-normal">
                        {source.name}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
                        <span aria-hidden="true" className="size-2 rounded-pill bg-ink" />
                        {t("partnerListingSources.access")}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-sm bg-surface-sunken py-2.5 pr-1.5 pl-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-mono text-[9px] tracking-[0.14em] text-ink-muted uppercase">
                        {t("partnerListingSources.providerId")}
                    </span>
                    <code className="truncate font-mono text-xs">{source.listingSourceId}</code>
                </span>
                <button
                    type="button"
                    className={ICON_BUTTON_CLASS}
                    aria-label={t("partnerListingSources.copyId", { name: source.name })}
                    onClick={() => void copyId()}
                >
                    <Copy aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                </button>
            </div>
            <Link
                to="/$lng/shops/$shopSlugId"
                params={(previous) => ({ ...previous, shopSlugId: source.listingSourceSlugId })}
                from="/$lng"
                className={cn(SMALL_SECONDARY_PILL_CLASS, "self-start")}
            >
                {t("partnerListingSources.publicPage")}
                <ArrowRight aria-hidden="true" className="size-[13px]" strokeWidth={1.8} />
            </Link>
        </li>
    );
}

function ProviderCardsSkeleton() {
    const { t } = useTranslation();
    return (
        <output aria-busy="true" className="block">
            <span className="sr-only">{t("partnerListingSources.loading")}</span>
            <ul className={GRID_CLASS}>
                {["provider-skeleton-1", "provider-skeleton-2"].map((id) => (
                    <li
                        key={id}
                        className="flex flex-col gap-4 rounded-panel bg-surface-raised p-5 shadow-ring"
                    >
                        <span className="flex items-center gap-3.5">
                            <span className="size-12 animate-pulse rounded-thumb bg-image-ground motion-reduce:animate-none" />
                            <span className="h-[18px] w-[55%] animate-pulse rounded-xs bg-surface-sunken motion-reduce:animate-none" />
                        </span>
                        <span className="h-13 animate-pulse rounded-sm bg-surface-sunken motion-reduce:animate-none" />
                        <span className="h-10 w-30 animate-pulse rounded-pill bg-surface-sunken motion-reduce:animate-none" />
                    </li>
                ))}
            </ul>
        </output>
    );
}
