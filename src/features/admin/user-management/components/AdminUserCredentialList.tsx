import { AppWindow, Bot, KeyRound, Plug } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type {
    AccessTokenOrigin,
    ConnectedApp,
} from "@/data/internal/access-tokens/OwnCredentials.ts";
import type { AdminUserCredentials } from "@/data/internal/admin/AdminAccessToken.ts";
import { AdminInlineConfirm } from "@/features/admin/common/components/AdminInlineConfirm.tsx";
import { AdminMark } from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_ROW_ACTION_CLASS,
    ADMIN_TAG_CLASS,
    MONO_LABEL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { getExpiryState } from "@/features/partner/access-token-management/lib/accessTokenExpiry.ts";
import {
    type ConnectedAppKind,
    getConnectedAppKind,
} from "@/features/partner/access-token-management/lib/connectedApps.ts";
import { cn } from "@/lib/utils.ts";

const KNOWN_ORIGINS: ReadonlySet<string> = new Set<AccessTokenOrigin>([
    "User",
    "OAuth",
    "OAuthMetadataDocument",
]);

const KIND_ICON: Record<ConnectedAppKind, LucideIcon> = {
    agent: Bot,
    browser: AppWindow,
    integration: Plug,
};

/** The translated origin; the raw value is never shown. */
function useOriginLabel() {
    const { t } = useTranslation();
    return (origin: string) =>
        KNOWN_ORIGINS.has(origin)
            ? t(`adminUsers.security.tokens.origins.${origin}`)
            : t("adminUsers.security.tokens.origins.unknown");
}

type RevokeKey = `revoke:${string}`;

/**
 * A user's credentials grouped like their own dashboard (board "Admin · User account"): connected
 * apps first, read-only for an agent's connection, then personal access tokens, each as a ruled row
 * with its kind tile, a mono meta line and scope tags. Single tokens, including a registered
 * client's, can be revoked; a connection ends only with "Revoke all".
 */
export function AdminUserCredentialList({
    credentials,
    confirmation,
    pending,
    disabled,
    now,
    onAsk,
    onCancel,
    onRevoke,
}: {
    readonly credentials: AdminUserCredentials;
    readonly confirmation: string | null;
    readonly pending: string | null;
    readonly disabled: boolean;
    /** The clock read after mount; null keeps dated tokens shown as valid. */
    readonly now: number | null;
    readonly onAsk: (key: RevokeKey) => void;
    readonly onCancel: () => void;
    readonly onRevoke: (accessTokenId: string) => void;
}) {
    const { t, i18n } = useTranslation();
    const originLabel = useOriginLabel();
    const dateFormat = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });
    const formatDate = (value: Date) => dateFormat.format(value);

    const expiryLabel = (expiresAt: Date | null) => {
        if (expiresAt === null) return t("partnerAccessTokens.noExpiration");
        const date = formatDate(expiresAt);
        return getExpiryState(expiresAt, now) === "expired"
            ? t("adminUsers.security.tokens.expiredOn", { date })
            : t("adminUsers.security.tokens.expiresOn", { date });
    };

    const revokeTrigger = (accessTokenId: string) => {
        const key: RevokeKey = `revoke:${accessTokenId}`;
        // The inline confirmation replaces its trigger.
        if (confirmation === key) return null;
        return (
            <button
                type="button"
                disabled={disabled}
                data-confirmation-trigger={key}
                onClick={() => onAsk(key)}
                className={ADMIN_ROW_ACTION_CLASS}
            >
                {t("adminUsers.security.actions.revokeToken")}
            </button>
        );
    };

    const revokeConfirm = (accessTokenId: string, message: string) =>
        confirmation === `revoke:${accessTokenId}` ? (
            <AdminInlineConfirm
                message={message}
                confirmLabel={t("adminUsers.security.actions.confirmTokenRevocation")}
                pending={pending === `revoke:${accessTokenId}`}
                onConfirm={() => onRevoke(accessTokenId)}
                onCancel={onCancel}
            />
        ) : null;

    const appName = (app: ConnectedApp) =>
        getConnectedAppKind(app) === "browser"
            ? t("partnerAccessTokens.connectedApps.browserAgentsName")
            : app.client.name;

    return (
        <div className="flex flex-col gap-4">
            {credentials.connectedApps.length > 0 && (
                <CredentialGroup
                    title={t("adminUsers.security.tokens.groups.connectedApps")}
                    count={credentials.connectedApps.length}
                >
                    {credentials.connectedApps.map((app) => {
                        const name = appName(app);
                        const meta: ReactNode[] = [originLabel(app.origin), app.client.host];
                        if (app.connection) {
                            if (app.connection.connectedAt) {
                                meta.push(
                                    t("adminUsers.security.tokens.connectedAt", {
                                        date: formatDate(app.connection.connectedAt),
                                    }),
                                );
                            }
                            if (app.connection.lastUsedAt) {
                                meta.push(
                                    t("adminUsers.security.tokens.lastUsedAt", {
                                        date: formatDate(app.connection.lastUsedAt),
                                    }),
                                );
                            }
                        } else {
                            meta.push(
                                <span key="id" className="normal-case">
                                    {app.client.clientId}
                                </span>,
                                t("adminUsers.security.tokens.tokenCount", {
                                    count: app.tokens.length,
                                }),
                            );
                        }
                        return (
                            <CredentialRow
                                key={app.client.clientId}
                                icon={KIND_ICON[getConnectedAppKind(app)]}
                                title={name}
                                meta={meta}
                                scopes={app.scopes}
                                aside={
                                    app.connection ? (
                                        <span className="rounded-sm bg-surface-sunken px-2 py-[3px] font-mono text-[10px] tracking-[0.12em] text-ink-secondary uppercase">
                                            {t("adminUsers.security.tokens.readOnly")}
                                        </span>
                                    ) : undefined
                                }
                            >
                                {app.connection && (
                                    <p className="text-xs leading-normal text-ink-muted">
                                        {t("adminUsers.security.tokens.connectionNote")}
                                    </p>
                                )}
                                {app.tokens.length > 0 && (
                                    <ul
                                        aria-label={t("adminUsers.security.tokens.clientTokens", {
                                            name,
                                        })}
                                        className="mt-1 border-t border-line-subtle"
                                    >
                                        {app.tokens.map((token) => (
                                            <li
                                                key={token.id}
                                                className="flex flex-col gap-2.5 border-b border-line-subtle py-2"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="flex min-w-0 flex-col gap-0.5">
                                                        <span className="inline-flex items-center gap-2 text-meta">
                                                            <AdminMark
                                                                tone={
                                                                    getExpiryState(
                                                                        token.expiresAt,
                                                                        now,
                                                                    ) === "expired"
                                                                        ? "hollow"
                                                                        : "ink"
                                                                }
                                                                className="size-2"
                                                            />
                                                            {expiryLabel(token.expiresAt)}
                                                        </span>
                                                        <code className="font-mono text-[11px] [overflow-wrap:anywhere] text-ink-muted">
                                                            {token.id}
                                                        </code>
                                                    </span>
                                                    {revokeTrigger(token.id)}
                                                </div>
                                                {revokeConfirm(
                                                    token.id,
                                                    t(
                                                        "adminUsers.security.tokens.confirmClientToken",
                                                        { name },
                                                    ),
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CredentialRow>
                        );
                    })}
                </CredentialGroup>
            )}
            {credentials.personalTokens.length > 0 && (
                <CredentialGroup
                    title={t("adminUsers.security.tokens.groups.personal")}
                    count={credentials.personalTokens.length}
                >
                    {credentials.personalTokens.map((token) => {
                        const meta: ReactNode[] = [
                            expiryLabel(token.expires ? new Date(token.expires) : null),
                            <span key="id" className="normal-case">
                                {token.accessTokenId}
                            </span>,
                        ];
                        if (token.origin !== "User") meta.unshift(originLabel(token.origin));
                        return (
                            <CredentialRow
                                key={token.accessTokenId}
                                icon={KeyRound}
                                title={token.name}
                                meta={meta}
                                scopes={token.scopes}
                                aside={revokeTrigger(token.accessTokenId)}
                                after={revokeConfirm(
                                    token.accessTokenId,
                                    t("adminUsers.security.tokens.confirmSingle", {
                                        name: token.name,
                                    }),
                                )}
                            />
                        );
                    })}
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
        <div className="flex flex-col gap-2">
            <h5 className={cn(MONO_LABEL_CLASS, "font-normal")}>
                {title} · {count}
            </h5>
            <ul className="border-t border-line">{children}</ul>
        </div>
    );
}

/** One ruled credential row: kind tile, title, mono meta line, scopes, and an action or tag. */
function CredentialRow({
    icon: Icon,
    title,
    meta,
    scopes,
    aside,
    after,
    children,
}: {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly meta: readonly ReactNode[];
    readonly scopes: readonly (keyof typeof ACCESS_TOKEN_SCOPE_METADATA)[];
    readonly aside?: ReactNode;
    readonly after?: ReactNode;
    readonly children?: ReactNode;
}) {
    const { t } = useTranslation();
    return (
        <li className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-3.5 border-b border-line-subtle py-3.5">
            <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary"
            >
                <Icon className="size-[17px]" strokeWidth={1.7} />
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
                <p className="text-[15px] font-medium break-words">{title}</p>
                <p className="font-mono text-[10px] tracking-[0.1em] [overflow-wrap:anywhere] text-ink-secondary uppercase">
                    {/* Strings need no key; the only element (the mono ID) carries its own. */}
                    {meta.flatMap((part, index) => (index === 0 ? [part] : [" · ", part]))}
                </p>
                <ul
                    aria-label={t("adminUsers.security.tokens.scopes")}
                    className="flex flex-wrap gap-1"
                >
                    {scopes.length > 0 ? (
                        scopes.map((scope) => (
                            <li key={scope} className={ADMIN_TAG_CLASS}>
                                {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
                            </li>
                        ))
                    ) : (
                        <li className={ADMIN_TAG_CLASS}>{t("partnerAccessTokens.noScopes")}</li>
                    )}
                </ul>
                {children}
            </div>
            {aside ? <div className="justify-self-end">{aside}</div> : <span />}
            {after && <div className="col-span-3">{after}</div>}
        </li>
    );
}
