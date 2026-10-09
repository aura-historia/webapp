import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminOverviewQueryOptions,
    createAdminOverviewErrorFactory,
} from "@/features/admin/overview/api/useAdminOverview.ts";
import { AdminOverviewPage } from "@/features/admin/overview/pages/AdminOverviewPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/overview")({
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, params: { lng } }) =>
        queryClient.prefetchQuery(
            adminOverviewQueryOptions(createAdminOverviewErrorFactory(i18n.getFixedT(lng))),
        ),
    component: AdminOverviewRoute,
});

function AdminOverviewRoute() {
    const { lng } = Route.useParams();
    return <AdminOverviewPage language={lng} />;
}
