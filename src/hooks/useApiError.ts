import { useTranslation } from "react-i18next";

export function useApiError() {
    const { t } = useTranslation();

    const getErrorMessage = (errorCode?: string): string => {
        if (!errorCode) {
            return t("apiErrors.unknown");
        }

        const translationKey = `apiErrors.${errorCode}`;
        const translated = t(translationKey);

        if (translated === translationKey) {
            console.log(`[useApiError] Unknown error code: ${errorCode}`);
            return t("apiErrors.unknown");
        }

        return translated;
    };

    return { getErrorMessage };
}
