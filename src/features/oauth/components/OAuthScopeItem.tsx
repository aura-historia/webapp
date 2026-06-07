import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";

export function OAuthScopeItem({ scope }: { readonly scope: string }) {
    const { t } = useTranslation();

    const scopeKey = scope.replace(":", "_");
    const description = t(`oauth.scopes.${scopeKey}.description`, { defaultValue: "" });

    return (
        <li className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
            <div className="flex flex-col gap-2">
                <Badge
                    variant="outline"
                    className="w-fit rounded-sm border-outline-variant/30 bg-surface-container font-mono text-[11px] text-primary"
                >
                    {scope}
                </Badge>
                {!!description && (
                    <span className="text-xs text-muted-foreground">{description}</span>
                )}
            </div>
        </li>
    );
}
