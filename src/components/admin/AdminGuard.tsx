import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import { ShieldAlert } from "lucide-react";
import { H1 } from "@/components/typography/H1.tsx";

interface AdminGuardProps {
    readonly children: ReactNode;
}

/**
 * Client-side admin role guard. Renders children only when the authenticated
 * user's role is ADMIN. While the role is unknown the component shows a
 * loading state. When the role is anything other than ADMIN (including when
 * the request fails or the user is unauthenticated) the component shows a
 * forbidden message and never renders the protected content.
 *
 * Note: The backend endpoints used by the admin dashboard are independently
 * secured with the same ADMIN role check, this guard is purely a UX layer.
 */
export function AdminGuard({ children }: AdminGuardProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useUserAccount();

    if (isLoading) {
        return (
            <div
                className="flex w-full justify-center py-24"
                role="status"
                aria-live="polite"
                aria-label={t("adminDashboard.loading")}
            >
                <Spinner />
            </div>
        );
    }

    if (isError || !data || data.role !== "ADMIN") {
        return (
            <div
                className="flex w-full flex-col items-center gap-4 px-6 py-24 text-center"
                role="alert"
            >
                <ShieldAlert className="h-12 w-12 text-destructive" aria-hidden="true" />
                <H1>{t("adminDashboard.forbidden.title")}</H1>
                <p className="max-w-md text-base text-muted-foreground">
                    {t("adminDashboard.forbidden.description")}
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
