import { createFileRoute } from "@tanstack/react-router";
import { AdminAuctionsPage } from "@/features/admin/auction-management/pages/AdminAuctionsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/auctions/")({
    component: AdminAuctionsRoute,
});

function AdminAuctionsRoute() {
    const { lng } = Route.useParams();
    return <AdminAuctionsPage language={lng} />;
}
