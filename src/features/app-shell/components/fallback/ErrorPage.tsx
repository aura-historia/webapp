import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { LoaderCircle, RotateCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FALLBACK_PRIMARY_BUTTON_CLASS,
    FallbackPage,
} from "@/features/app-shell/components/fallback/FallbackPage.tsx";

/** The router's default error page; Try again reloads the routes that failed. */
export function ErrorPage({ reset }: Pick<ErrorComponentProps, "reset">) {
    const { t } = useTranslation();
    const router = useRouter();
    const queryErrorResetBoundary = useQueryErrorResetBoundary();
    const [isRetrying, setIsRetrying] = useState(false);

    const retry = async () => {
        if (isRetrying) return;
        setIsRetrying(true);
        queryErrorResetBoundary.reset();
        try {
            await router.invalidate();
            reset();
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <FallbackPage
            kind="error"
            primaryAction={
                <button
                    type="button"
                    onClick={retry}
                    aria-disabled={isRetrying || undefined}
                    className={FALLBACK_PRIMARY_BUTTON_CLASS}
                >
                    {isRetrying ? (
                        <LoaderCircle
                            aria-hidden="true"
                            className="size-[15px] animate-spin motion-reduce:animate-none"
                            strokeWidth={2}
                        />
                    ) : (
                        <RotateCw aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    )}
                    {isRetrying ? t("fallback.error.retrying") : t("fallback.error.retry")}
                </button>
            }
        />
    );
}
