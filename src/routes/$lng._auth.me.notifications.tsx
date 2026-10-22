import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenterPage } from "@/features/notification-center/pages/NotificationCenterPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/me/notifications")({
    head: () => generatePageHeadMeta({ pageKey: "notifications", noIndex: true }),
    component: NotificationCenterPage,
});
