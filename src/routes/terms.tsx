import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/terms")({
    component: RouteComponent,
});

function RouteComponent() {
    const { t } = useTranslation();
    return <div>{t("terms.title")}</div>;
}
