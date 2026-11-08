import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

/** The ruled line before the actions: access can be revoked; authorize only trusted apps. */
export function OAuthSecurityNote() {
    const { t } = useTranslation();
    return (
        <p className="flex items-start gap-2.5 border-t border-line pt-4 text-meta leading-normal text-ink-secondary">
            <Shield
                className="mt-px size-4 shrink-0 text-ink-muted"
                strokeWidth={1.8}
                aria-hidden="true"
            />
            <span>{t("oauth.authorize.securityNote")}</span>
        </p>
    );
}
