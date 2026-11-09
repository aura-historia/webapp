import { useTranslation } from "react-i18next";
import {
    ACCESS_TOKEN_SCOPE_METADATA,
    type AccessTokenScope,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";

/** One ruled permission row: its label, the scope id as a mono tag, and what it allows. */
export function OAuthScopeItem({ scope }: { readonly scope: string }) {
    const { t } = useTranslation();

    const metadata = Object.hasOwn(ACCESS_TOKEN_SCOPE_METADATA, scope)
        ? ACCESS_TOKEN_SCOPE_METADATA[scope as AccessTokenScope]
        : undefined;
    const description = metadata ? t(metadata.description) : "";

    return (
        <li className="flex flex-col gap-0.5 border-t border-line py-3 last:border-b">
            <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                {metadata && (
                    <span className="text-sm leading-normal font-medium text-ink">
                        {t(metadata.label)}
                    </span>
                )}
                <code className="shrink-0 rounded-sm bg-surface-sunken px-1.5 py-[3px] font-mono text-[10px] leading-[1.2] tracking-[0.08em] text-ink-secondary">
                    {scope}
                </code>
            </span>
            {!!description && (
                <span className="text-meta leading-normal text-ink-muted">{description}</span>
            )}
        </li>
    );
}
