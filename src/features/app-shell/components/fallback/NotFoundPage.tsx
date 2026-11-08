import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    FALLBACK_PRIMARY_BUTTON_CLASS,
    FallbackPage,
} from "@/features/app-shell/components/fallback/FallbackPage.tsx";

/** The router's default not-found page. */
export function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <FallbackPage
            kind="notFound"
            primaryAction={
                <Link
                    to="/$lng/search"
                    params={true}
                    from="/$lng"
                    className={FALLBACK_PRIMARY_BUTTON_CLASS}
                >
                    <Search aria-hidden="true" className="size-[15px]" strokeWidth={1.8} />
                    {t("fallback.searchObjects")}
                </Link>
            }
        />
    );
}
