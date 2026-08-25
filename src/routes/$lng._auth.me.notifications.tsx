import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenterPage } from "@/features/notification-center/pages/NotificationCenterPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/me/notifications")({
    head: () => generatePageHeadMeta({ pageKey: "notifications", noIndex: true }),
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-8 pb-8 ml-8 mr-8 lg:ml-auto lg:mr-auto">
            <NotificationCenterPage />
        </div>
    );
}
