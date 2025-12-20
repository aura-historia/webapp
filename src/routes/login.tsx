import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Authenticator } from "@/components/auth/Authenticator.tsx";
import "../amplify-config";

type LoginSearch = {
    redirect?: string;
};

export const Route = createFileRoute("/login")({
    validateSearch: (search: Record<string, unknown>): LoginSearch => {
        return {
            redirect: typeof search.redirect === "string" ? search.redirect : undefined,
        };
    },
    component: LoginPage,
});

function LoginPage() {
    const { redirect } = Route.useSearch();
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-[2fr_auto_3fr] min-h-screen">
            <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">Aura Historia</span>
                <p className="text-xl text-muted-foreground mt-6 max-w-md text-center">
                    {t("auth.subtitle")}
                </p>
            </div>

            <div className="flex items-center justify-center">
                <div className="w-px bg-gray-300 h-[80%]"></div>
            </div>

            <div className="flex justify-center items-center">
                <Authenticator redirect={redirect} />
            </div>
        </div>
    );
}
