import { RefreshCw, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useOwnListingSources } from "@/features/partner/common/api/useOwnListingSources.ts";

export function PartnerListingSourcesSection() {
    const { t } = useTranslation();
    const { isAuthenticated, isResolved } = useResolvedAuth();
    const {
        data: sources = [],
        isPending,
        isError,
        refetch,
    } = useOwnListingSources(isAuthenticated);

    let sourceContent: ReactNode;
    if (!isResolved || (isAuthenticated && isPending)) {
        sourceContent = (
            <div role="status" aria-live="polite">
                <span className="sr-only">{t("partnerListingSources.loading")}</span>
                <ul className="flex flex-col gap-2">
                    {["source-skeleton-1", "source-skeleton-2"].map((id) => (
                        <li key={id} className="border bg-surface-container-low p-3">
                            <Skeleton className="h-5 w-full max-w-64" />
                        </li>
                    ))}
                </ul>
            </div>
        );
    } else if (isError && isAuthenticated) {
        sourceContent = (
            <div
                role="alert"
                className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center"
            >
                <p className="text-sm text-muted-foreground">
                    {t("partnerListingSources.loadError")}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    {t("partnerListingSources.actions.retry")}
                </Button>
            </div>
        );
    } else if (!isAuthenticated || sources.length === 0) {
        sourceContent = (
            <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                <SearchX className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{t("partnerListingSources.empty")}</p>
            </div>
        );
    } else {
        sourceContent = (
            <ul className="flex flex-col gap-2">
                {sources.map((source) => (
                    <li
                        key={source.listingSourceId}
                        className="flex min-w-0 flex-col gap-1 border bg-surface-container-low p-3"
                    >
                        <span className="break-words font-medium">{source.name}</span>
                        <span className="break-all text-xs text-muted-foreground">
                            {source.listingSourceId}
                        </span>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <section className="flex flex-col gap-4" aria-labelledby="partner-sources-title">
            <header className="flex flex-col gap-1">
                <H2 id="partner-sources-title">{t("partnerListingSources.title")}</H2>
                <p className="text-sm text-muted-foreground md:text-base">
                    {t("partnerListingSources.description")}
                </p>
            </header>
            {sourceContent}
        </section>
    );
}
