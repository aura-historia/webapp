import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/imprint")({
    component: RouteComponent,
});

function RouteComponent() {
    const { t } = useTranslation();
    return <div>{t("imprint.title")}</div>;
}
