import { KeyRound, RefreshCw, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { useAccessTokens } from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import type { AccessToken } from "@/features/partner/access-token-management/types/AccessToken.ts";
import { formatDateTime } from "@/lib/utils.ts";

const SCOPE_TRANSLATION_KEYS = {
    "shops:manage": "partnerAccessTokens.scopes.shopsManage",
    "products:write": "partnerAccessTokens.scopes.productsWrite",
} as const;

export function AccessTokensSection() {
    const { t, i18n } = useTranslation();
    const { data: accessTokens = [], isPending, isError, refetch } = useAccessTokens();

    if (isPending) {
        return (
            <AccessTokensLayout>
                <AccessTokensSkeleton />
            </AccessTokensLayout>
        );
    }

    if (isError) {
        return (
            <AccessTokensLayout>
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("partnerAccessTokens.loadError")}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        {t("partnerAccessTokens.actions.retry")}
                    </Button>
                </div>
            </AccessTokensLayout>
        );
    }

    if (accessTokens.length === 0) {
        return (
            <AccessTokensLayout>
                <div className="flex flex-col items-center gap-3 border bg-surface-container-low px-4 py-12 text-center">
                    <SearchX className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                        {t("partnerAccessTokens.empty")}
                    </p>
                </div>
            </AccessTokensLayout>
        );
    }

    return (
        <AccessTokensLayout>
            <ul className="flex flex-col gap-4">
                {accessTokens.map((accessToken) => (
                    <AccessTokenListItem
                        key={accessToken.id}
                        accessToken={accessToken}
                        locale={i18n.language}
                    />
                ))}
            </ul>
        </AccessTokensLayout>
    );
}

function AccessTokensLayout({ children }: { readonly children: React.ReactNode }) {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col gap-4" aria-labelledby="partner-access-tokens-title">
            <header className="flex flex-col gap-1">
                <H2 id="partner-access-tokens-title">{t("partnerAccessTokens.title")}</H2>
                <p className="text-sm text-muted-foreground md:text-base">
                    {t("partnerAccessTokens.description")}
                </p>
            </header>
            {children}
        </section>
    );
}

function AccessTokenListItem({
    accessToken,
    locale,
}: {
    readonly accessToken: AccessToken;
    readonly locale: string;
}) {
    const { t } = useTranslation();

    return (
        <li className="flex flex-col gap-4 border bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <KeyRound
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <span className="truncate font-medium" title={accessToken.name}>
                        {accessToken.name}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {accessToken.scopes.length > 0 ? (
                        accessToken.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary">
                                {t(SCOPE_TRANSLATION_KEYS[scope])}
                            </Badge>
                        ))
                    ) : (
                        <Badge variant="outline">{t("partnerAccessTokens.noScopes")}</Badge>
                    )}
                </div>
            </div>

            <code className="w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap bg-muted px-2 py-1 text-xs">
                {accessToken.maskedToken}
            </code>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                    {accessToken.expiresAt
                        ? t("partnerAccessTokens.expiresAt", {
                              date: formatDateTime(accessToken.expiresAt, locale),
                          })
                        : t("partnerAccessTokens.noExpiration")}
                </span>
                <span>
                    {t("partnerAccessTokens.createdAt", {
                        date: formatDateTime(accessToken.created, locale),
                    })}
                </span>
                <span>
                    {t("partnerAccessTokens.updatedAt", {
                        date: formatDateTime(accessToken.updated, locale),
                    })}
                </span>
                <span title={accessToken.id} className="font-mono">
                    #{accessToken.id.slice(0, 8)}
                </span>
            </div>
        </li>
    );
}

function AccessTokensSkeleton() {
    const { t } = useTranslation();

    return (
        <div role="status" aria-live="polite">
            <span className="sr-only">{t("partnerAccessTokens.loading")}</span>
            <ul className="flex flex-col gap-3">
                {["access-token-skeleton-1", "access-token-skeleton-2"].map((id) => (
                    <li
                        key={id}
                        className="flex flex-col gap-3 border bg-surface-container-low p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <Skeleton className="h-5 w-full max-w-64" />
                            <Skeleton className="h-6 w-28 rounded-none" />
                        </div>
                        <Skeleton className="h-7 w-full max-w-80 rounded-none" />
                        <div className="flex flex-wrap gap-3">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
