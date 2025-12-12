import { useTranslation } from "react-i18next";
import type { ApiErrorData } from "@/data/internal/ApiError";

export function useApiError() {
    const { t } = useTranslation();

    const getErrorMessage = (error: ApiErrorData): string => {
        console.error("[API Error]", {
            status: error.status,
            title: error.title,
            code: error.error,
            detail: error.detail,
            source: error.source,
        });

        const translationKey = `apiErrors.${error.error}`;
        const translated = t(translationKey);

        if (translated === translationKey) {
            console.error(`[useApiError] Unknown error code: ${error.error}`);
            return t("apiErrors.unknown");
        }

        return translated;
    };

    return { getErrorMessage };
}
