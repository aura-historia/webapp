import { createFileRoute, Outlet } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import { isSupportedLanguage } from "@/i18n/routing.ts";

export const Route = createFileRoute("/$lng")({
    beforeLoad: async ({ params }) => {
        if (isSupportedLanguage(params.lng) && i18n.resolvedLanguage !== params.lng) {
            await i18n.changeLanguage(params.lng);
        }
    },
    component: Outlet,
});
