import { AppWindow, Bot, Plug, Unplug } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { ConnectedApp } from "@/data/internal/access-tokens/OwnCredentials.ts";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    DANGER_PILL_CLASS,
    FOCUS_CLASS,
    MONO_LABEL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn, formatDateTime } from "@/lib/utils.ts";
import type { ConnectedAppExpiry, ConnectedAppKind } from "../lib/connectedApps.ts";
import { AccessTokenExpiry } from "./AccessTokenRow.tsx";

const VISIBLE_SCOPES = 3;

const KIND_ICON: Record<ConnectedAppKind, LucideIcon> = {
    agent: Bot,
    browser: AppWindow,
    integration: Plug,
};

const META_VALUE_CLASS = "font-mono text-[11px] tracking-[0.1em] text-ink-secondary uppercase";

/**
 * A ruled connected app row: kind tile, name, kind and verified host, permissions, dates or tokens,
 * and Disconnect with an inline confirmation (board "Connected app row").
 */
export function ConnectedAppRow({
    app,
    kind,
    displayName,
    expiry,
    confirming,
    pending,
    actionsDisabled,
    onDisconnect,
    onCancel,
    onConfirm,
}: {
    readonly app: ConnectedApp;
    readonly kind: ConnectedAppKind;
    readonly displayName: string;
    readonly expiry: ConnectedAppExpiry | null;
    readonly confirming: boolean;
    readonly pending: boolean;
    readonly actionsDisabled: boolean;
    readonly onDisconnect: () => void;
    readonly onCancel: () => void;
    readonly onConfirm: () => void;
}) {
    const { t, i18n } = useTranslation();
    const [showAll, setShowAll] = useState(false);
    const promptId = useId();
    const groupRef = useRef<HTMLFieldSetElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const wasConfirming = useRef(confirming);
    const Icon = KIND_ICON[kind];
    const scopes = app.scopes;
    const hidden = scopes.length - VISIBLE_SCOPES;
    const shown = showAll ? scopes : scopes.slice(0, VISIBLE_SCOPES);

    // The trigger is replaced by the confirmation, so focus moves there and back again.
    useEffect(() => {
        if (confirming && !wasConfirming.current) groupRef.current?.focus();
        if (!confirming && wasConfirming.current) triggerRef.current?.focus();
        wasConfirming.current = confirming;
    }, [confirming]);

    const meta: { key: string; label: string; value: string }[] = [];
    if (app.connection) {
        if (app.connection.connectedAt) {
            meta.push({
                key: "connected",
                label: t("partnerAccessTokens.connectedApps.meta.connected"),
                value: formatDateTime(app.connection.connectedAt, i18n.language),
            });
        }
        if (app.connection.lastUsedAt) {
            meta.push({
                key: "lastUsed",
                label: t("partnerAccessTokens.connectedApps.meta.lastUsed"),
                value: formatDateTime(app.connection.lastUsedAt, i18n.language),
            });
        }
    } else if (app.tokens.length > 0) {
        meta.push({
            key: "tokens",
            label: t("partnerAccessTokens.connectedApps.meta.tokens"),
            value: String(app.tokens.length),
        });
    }

    const metaList = (className: string) =>
        meta.length > 0 || expiry ? (
            <dl className={className}>
                {meta.map((item) => (
                    <div key={item.key} className="flex flex-col gap-0.5">
                        <dt className={MONO_LABEL_CLASS}>{item.label}</dt>
                        <dd className={META_VALUE_CLASS}>{item.value}</dd>
                    </div>
                ))}
                {expiry && (
                    <div className="flex flex-col gap-0.5">
                        <dt className="sr-only">
                            {t("partnerAccessTokens.connectedApps.meta.expiry")}
                        </dt>
                        <dd>
                            <AccessTokenExpiry
                                expiresAt={expiry.expiresAt}
                                state={expiry.state}
                                className="text-[11px] tracking-[0.1em]"
                            />
                        </dd>
                    </div>
                )}
            </dl>
        ) : null;

    let description: string;
    if (kind === "integration") {
        description = t("partnerAccessTokens.connectedApps.disconnect.integrationDescription", {
            count: app.tokens.length,
        });
    } else if (kind === "browser") {
        description = t("partnerAccessTokens.connectedApps.disconnect.browserDescription");
    } else {
        description = t("partnerAccessTokens.connectedApps.disconnect.agentDescription");
    }

    return (
        <li className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-x-5 gap-y-3 border-b border-line-subtle py-4 sm:px-2 sm:py-[18px] xl:grid-cols-[40px_minmax(0,1fr)_190px_132px]">
            <span
                aria-hidden="true"
                className="inline-flex size-10 items-center justify-center rounded-md bg-surface-sunken text-ink-secondary"
            >
                <Icon className="size-[18px]" strokeWidth={1.7} />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3
                        className="truncate text-base leading-[1.35] font-medium text-ink"
                        title={displayName}
                    >
                        {displayName}
                    </h3>
                    <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase">
                            {t(`partnerAccessTokens.connectedApps.kind.${kind}`)}
                        </span>
                        <span aria-hidden="true" className="text-line-strong">
                            ·
                        </span>
                        <span className="min-w-0 truncate font-mono text-xs text-ink-secondary">
                            {app.client.host}
                        </span>
                    </p>
                </div>
                {metaList("flex flex-wrap gap-x-5 gap-y-2 xl:hidden")}
                <ul
                    aria-label={t("partnerAccessTokens.permissions")}
                    className="flex flex-wrap gap-1.5"
                >
                    {shown.map((scope) => (
                        <li
                            key={scope}
                            className="rounded-sm bg-surface-sunken px-2 py-[3px] text-xs leading-[1.5] text-ink-secondary"
                        >
                            {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
                        </li>
                    ))}
                    {scopes.length === 0 && (
                        <li className="rounded-sm px-2 py-[3px] text-xs leading-[1.5] text-ink-muted shadow-[inset_0_0_0_1px_var(--line)]">
                            {t("partnerAccessTokens.noScopes")}
                        </li>
                    )}
                    {hidden > 0 && (
                        <li>
                            <button
                                type="button"
                                aria-expanded={showAll}
                                onClick={() => setShowAll((value) => !value)}
                                className={cn(
                                    "cursor-pointer rounded-sm px-2 py-[3px] text-xs leading-[1.5] font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]",
                                    FOCUS_CLASS,
                                )}
                            >
                                {showAll
                                    ? t("partnerAccessTokens.showFewer")
                                    : t("partnerAccessTokens.showMore", { count: hidden })}
                            </button>
                        </li>
                    )}
                </ul>
            </div>
            {metaList("hidden flex-col gap-2 pt-0.5 xl:flex")}
            <div className="-mt-0.5 flex min-w-10 justify-end">
                {!confirming && (
                    <button
                        ref={triggerRef}
                        type="button"
                        disabled={actionsDisabled}
                        onClick={onDisconnect}
                        aria-label={t(
                            "partnerAccessTokens.connectedApps.disconnect.openAriaLabel",
                            {
                                name: displayName,
                            },
                        )}
                        className={cn(
                            "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill px-3 text-meta font-medium whitespace-nowrap text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:text-oxblood hover:enabled:shadow-[inset_0_0_0_1px_var(--oxblood)] disabled:cursor-not-allowed disabled:opacity-45 xl:pr-4 xl:pl-3.5",
                            FOCUS_CLASS,
                        )}
                    >
                        <Unplug aria-hidden="true" className="size-[15px]" strokeWidth={1.7} />
                        <span className="hidden xl:inline">
                            {t("partnerAccessTokens.connectedApps.disconnect.open")}
                        </span>
                    </button>
                )}
            </div>
            {confirming && (
                <fieldset
                    ref={groupRef}
                    aria-labelledby={promptId}
                    aria-busy={pending}
                    tabIndex={-1}
                    className="col-span-full m-0 flex min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-md border-0 bg-surface-sunken px-[18px] py-4 outline-none xl:ml-[60px]"
                >
                    <p id={promptId} className="min-w-0 flex-[1_1_320px] text-sm leading-[1.55]">
                        <strong className="font-medium text-ink">
                            {t("partnerAccessTokens.connectedApps.disconnect.confirmTitle", {
                                name: displayName,
                            })}
                        </strong>{" "}
                        <span className="text-ink-secondary">{description}</span>
                    </p>
                    <div className="flex basis-full justify-end gap-2.5 sm:basis-auto">
                        <button
                            type="button"
                            className={cn(SECONDARY_PILL_CLASS, "flex-1 sm:flex-none")}
                            disabled={pending}
                            onClick={onCancel}
                        >
                            {t("partnerAccessTokens.delete.cancel")}
                        </button>
                        <button
                            type="button"
                            className={cn(DANGER_PILL_CLASS, "flex-1 sm:flex-none")}
                            disabled={pending}
                            onClick={onConfirm}
                        >
                            {pending && <Spinner aria-hidden="true" />}
                            {pending
                                ? t("partnerAccessTokens.connectedApps.disconnect.pending")
                                : t("partnerAccessTokens.connectedApps.disconnect.confirm")}
                        </button>
                    </div>
                </fieldset>
            )}
        </li>
    );
}
