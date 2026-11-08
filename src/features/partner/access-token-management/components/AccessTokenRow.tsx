import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    FOCUS_CLASS,
    ICON_BUTTON_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn, formatDateTime } from "@/lib/utils.ts";
import type { AccessTokenExpiryState } from "../lib/accessTokenExpiry.ts";

const VISIBLE_SCOPES = 3;

const EXPIRY_STYLE: Record<AccessTokenExpiryState, { label: string; mark: string }> = {
    none: { label: "text-ink-secondary", mark: "bg-ink" },
    later: { label: "text-ink-secondary", mark: "bg-ink" },
    soon: { label: "text-brass-ink", mark: "shadow-[inset_0_0_0_2px_var(--brass)]" },
    expired: { label: "text-ink-muted", mark: "shadow-[inset_0_0_0_1.5px_var(--ink-muted)]" },
};

/** The expiry as a mono label with its mark: filled valid, brass ring soon, hollow expired. */
export function AccessTokenExpiry({
    accessToken,
    state,
    className,
}: {
    readonly accessToken: AccessToken;
    readonly state: AccessTokenExpiryState;
    readonly className?: string;
}) {
    const { t, i18n } = useTranslation();
    const style = EXPIRY_STYLE[state];
    let label = t("partnerAccessTokens.noExpiration");
    if (accessToken.expiresAt) {
        const date = formatDateTime(accessToken.expiresAt, i18n.language);
        label =
            state === "expired"
                ? t("partnerAccessTokens.expiredAt", { date })
                : t("partnerAccessTokens.expiresAt", { date });
    }
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase",
                style.label,
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn("size-[9px] shrink-0 rounded-pill", style.mark)}
            />
            {label}
        </span>
    );
}

/** A ruled token row: name, permission tags, expiry, Edit and Delete (board "Access token row"). */
export function AccessTokenRow({
    accessToken,
    expiry,
    actionsDisabled,
    onEdit,
    onDelete,
}: {
    readonly accessToken: AccessToken;
    readonly expiry: AccessTokenExpiryState;
    readonly actionsDisabled: boolean;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
}) {
    const { t } = useTranslation();
    const [showAll, setShowAll] = useState(false);
    const scopes = accessToken.scopes;
    const hidden = scopes.length - VISIBLE_SCOPES;
    const shown = showAll ? scopes : scopes.slice(0, VISIBLE_SCOPES);
    const expired = expiry === "expired";

    return (
        <li className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-x-5 gap-y-3 border-b border-line-subtle py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto_auto] sm:px-2 sm:py-[18px]">
            <span
                aria-hidden="true"
                className={cn(
                    "inline-flex size-10 items-center justify-center rounded-md bg-surface-sunken",
                    expired ? "text-ink-muted" : "text-ink-secondary",
                )}
            >
                <KeyRound className="size-[17px]" strokeWidth={1.7} />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
                <h3
                    className={cn(
                        "truncate text-base leading-[1.35] font-medium",
                        expired ? "text-ink-muted" : "text-ink",
                    )}
                    title={accessToken.name}
                >
                    {accessToken.name}
                </h3>
                <AccessTokenExpiry accessToken={accessToken} state={expiry} className="sm:hidden" />
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
            <AccessTokenExpiry
                accessToken={accessToken}
                state={expiry}
                className="hidden pt-[3px] whitespace-nowrap sm:inline-flex"
            />
            <div className="-mt-1 flex gap-1">
                <button
                    type="button"
                    className={ICON_BUTTON_CLASS}
                    disabled={actionsDisabled}
                    onClick={onEdit}
                    aria-label={t("partnerAccessTokens.edit.openAriaLabel", {
                        name: accessToken.name,
                    })}
                >
                    <Pencil aria-hidden="true" className="size-4" strokeWidth={1.7} />
                </button>
                <button
                    type="button"
                    className={cn(ICON_BUTTON_CLASS, "hover:enabled:text-oxblood")}
                    disabled={actionsDisabled}
                    onClick={onDelete}
                    aria-label={t("partnerAccessTokens.delete.openAriaLabel", {
                        name: accessToken.name,
                    })}
                >
                    <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.7} />
                </button>
            </div>
        </li>
    );
}
