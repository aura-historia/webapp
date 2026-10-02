import { RefreshCw, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useOwnListingSources } from "@/features/partner/common/api/useOwnListingSources.ts";

export function PartnerShopsSection() {
    const { t } = useTranslation();
    const { isAuthenticated, isResolved } = useResolvedAuth();
    const {
        data: sources = [],
        isPending,
        isError,
        refetch,
    } = useOwnListingSources(isAuthenticated);

    return (
        <section className="flex flex-col gap-4" aria-labelledby="partner-sources-title">
            <header className="flex flex-col gap-1">
                <H2 id="partner-sources-title">{t("partnerShops.title")}</H2>
                <p className="text-sm text-muted-foreground md:text-base">
                    {t("partnerShops.description")}
                </p>
            </header>
            {!isResolved || (isAuthenticated && isPending) ? (
                <div role="status" aria-live="polite">
                    <span className="sr-only">{t("partnerShops.loading")}</span>
                    <ul className="flex flex-col gap-2">
                        {["source-skeleton-1", "source-skeleton-2"].map((id) => (
                            <li key={id} className="border bg-surface-container-low p-3">
                                <Skeleton className="h-5 w-full max-w-64" />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : isError && isAuthenticated ? (
                <div
                    role="alert"
                    className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center"
                >
                    <p className="text-sm text-muted-foreground">{t("partnerShops.loadError")}</p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        {t("partnerShops.actions.retry")}
                    </Button>
                </div>
            ) : !isAuthenticated || sources.length === 0 ? (
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <SearchX className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">{t("partnerShops.empty")}</p>
                </div>
            ) : (
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
            )}
        </section>
    );
}
