import { useTranslation } from "react-i18next";

export function AccessTokenUnsupportedScopesNotice({
    scopes,
}: {
    readonly scopes: readonly string[];
}) {
    const { t } = useTranslation();
    if (scopes.length === 0) {
        return null;
    }

    return (
        <p role="note" className="text-sm break-words text-destructive">
            {t("partnerAccessTokens.unsupportedScopes", { scopes: scopes.join(", ") })}
        </p>
    );
}
