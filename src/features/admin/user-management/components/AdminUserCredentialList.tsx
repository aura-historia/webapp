import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type {
    AccessTokenOrigin,
    ConnectedApp,
} from "@/data/internal/access-tokens/OwnCredentials.ts";
import type { AdminUserCredentials } from "@/data/internal/admin/AdminAccessToken.ts";
import { getConnectedAppKind } from "@/features/partner/access-token-management/lib/connectedApps.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { AdminConfirmation } from "./AdminConfirmation.tsx";

const KNOWN_ORIGINS: ReadonlySet<string> = new Set<AccessTokenOrigin>([
    "User",
    "OAuth",
    "OAuthMetadataDocument",
]);

/** The translated origin; the raw value is never shown. */
export function useOriginLabel() {
    const { t } = useTranslation();
    return (origin: string) =>
        KNOWN_ORIGINS.has(origin)
            ? t(`adminUsers.security.tokens.origins.${origin}`)
            : t("adminUsers.security.tokens.origins.unknown");
}

type RevokeKey = `revoke:${string}`;

/**
 * A user's credentials grouped like their own dashboard (board "Admin · User security"): connected
 * apps first, read-only for an agent's connection, then personal access tokens. Single tokens,
 * including a registered client's, can be revoked; a connection ends only with "revoke all".
 */
export function AdminUserCredentialList({
    credentials,
    confirmation,
    pending,
    disabled,
    onAsk,
    onCancel,
    onRevoke,
}: {
    readonly credentials: AdminUserCredentials;
    readonly confirmation: string | null;
    readonly pending: string | null;
    readonly disabled: boolean;
    readonly onAsk: (key: RevokeKey) => void;
    readonly onCancel: () => void;
    readonly onRevoke: (accessTokenId: string) => void;
}) {
    const { t, i18n } = useTranslation();
    const originLabel = useOriginLabel();
    const formatDate = (value: Date | string) =>
        formatDateTime(typeof value === "string" ? new Date(value) : value, i18n.language);

    const revokeControl = (accessTokenId: string, prompt: string) => {
        const key: RevokeKey = `revoke:${accessTokenId}`;
        return confirmation === key ? (
            <AdminConfirmation
                prompt={prompt}
                confirmLabel={t("adminUsers.security.actions.confirmTokenRevocation")}
                disabled={disabled}
                onConfirm={() => onRevoke(accessTokenId)}
                onCancel={onCancel}
            />
        ) : (
            <div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    data-confirmation-trigger={key}
                    onClick={() => onAsk(key)}
                >
                    {pending === key
                        ? t("adminUsers.security.actions.revoking")
                        : t("adminUsers.security.actions.revokeToken")}
                </Button>
            </div>
        );
    };

    const appName = (app: ConnectedApp) =>
        getConnectedAppKind(app) === "browser"
            ? t("partnerAccessTokens.connectedApps.browserAgentsName")
            : app.client.name;

    return (
        <div className="grid gap-5">
            {credentials.connectedApps.length > 0 && (
                <CredentialGroup
                    title={t("adminUsers.security.tokens.groups.connectedApps")}
                    count={credentials.connectedApps.length}
                >
                    {credentials.connectedApps.map((app) => (
                        <li key={app.client.clientId} className="grid gap-2 border p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <h4 className="font-medium break-words">{appName(app)}</h4>
                                {app.connection && (
                                    <span className="border px-2 py-1 font-mono text-[10px] tracking-[0.12em] uppercase">
                                        {t("adminUsers.security.tokens.readOnly")}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t("adminUsers.security.tokens.origin", {
                                    origin: originLabel(app.origin),
                                })}
                            </p>
                            <p className="text-sm break-all text-muted-foreground">
                                {t("adminUsers.security.tokens.client", {
                                    host: app.client.host,
                                })}{" "}
                                <code className="text-xs">{app.client.clientId}</code>
                            </p>
                            {app.connection?.connectedAt && (
                                <p className="text-sm text-muted-foreground">
                                    {t("adminUsers.security.tokens.connectedAt", {
                                        date: formatDate(app.connection.connectedAt),
                                    })}
                                    {app.connection.lastUsedAt &&
                                        ` · ${t("adminUsers.security.tokens.lastUsedAt", {
                                            date: formatDate(app.connection.lastUsedAt),
                                        })}`}
                                </p>
                            )}
                            <ScopeTags scopes={app.scopes} />
                            {app.tokens.length > 0 && (
                                <ul
                                    aria-label={t("adminUsers.security.tokens.clientTokens", {
                                        name: appName(app),
                                    })}
                                    className="grid border-t"
                                >
                                    {app.tokens.map((token) => (
                                        <li key={token.id} className="grid gap-2 border-b py-3">
                                            <p className="text-sm">
                                                {token.expiresAt
                                                    ? t("adminUsers.security.tokens.expires", {
                                                          expires: formatDate(token.expiresAt),
                                                      })
                                                    : t("partnerAccessTokens.noExpiration")}
                                            </p>
                                            <code className="text-xs break-all text-muted-foreground">
                                                {token.id}
                                            </code>
                                            {revokeControl(
                                                token.id,
                                                t("adminUsers.security.tokens.confirmClientToken", {
                                                    name: appName(app),
                                                }),
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {app.connection && (
                                <p className="text-xs text-muted-foreground">
                                    {t("adminUsers.security.tokens.readOnlyNote")}{" "}
                                    <code className="break-all">{app.connection.id}</code>
                                </p>
                            )}
                        </li>
                    ))}
                </CredentialGroup>
            )}
            {credentials.personalTokens.length > 0 && (
                <CredentialGroup
                    title={t("adminUsers.security.tokens.groups.personal")}
                    count={credentials.personalTokens.length}
                >
                    {credentials.personalTokens.map((token) => (
                        <li
                            key={token.accessTokenId}
                            className="grid gap-3 border p-4 sm:flex sm:items-start sm:justify-between"
                        >
                            <div className="grid min-w-0 gap-2">
                                <h4 className="font-medium break-words">{token.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {t("adminUsers.security.tokens.origin", {
                                        origin: originLabel(token.origin),
                                    })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {token.expires
                                        ? t("adminUsers.security.tokens.expires", {
                                              expires: formatDate(token.expires),
                                          })
                                        : t("partnerAccessTokens.noExpiration")}
                                </p>
                                <ScopeTags scopes={token.scopes} />
                                <code className="text-xs break-all text-muted-foreground">
                                    {token.accessTokenId}
                                </code>
                            </div>
                            {revokeControl(
                                token.accessTokenId,
                                t("adminUsers.security.tokens.confirmSingle", { name: token.name }),
                            )}
                        </li>
                    ))}
                </CredentialGroup>
            )}
        </div>
    );
}

function CredentialGroup({
    title,
    count,
    children,
}: {
    readonly title: string;
    readonly count: number;
    readonly children: ReactNode;
}) {
    return (
        <div className="grid gap-2.5">
            <h4 className="text-sm font-semibold">
                {title} <span className="font-normal text-muted-foreground">· {count}</span>
            </h4>
            <ul className="grid gap-2.5">{children}</ul>
        </div>
    );
}

function ScopeTags({
    scopes,
}: {
    readonly scopes: readonly (keyof typeof ACCESS_TOKEN_SCOPE_METADATA)[];
}) {
    const { t } = useTranslation();
    return (
        <div className="flex flex-wrap gap-2">
            {scopes.length > 0 ? (
                scopes.map((scope) => (
                    <span key={scope} className="border px-2 py-1 text-xs">
                        {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
                    </span>
                ))
            ) : (
                <span className="border px-2 py-1 text-xs">
                    {t("partnerAccessTokens.noScopes")}
                </span>
            )}
        </div>
    );
}
