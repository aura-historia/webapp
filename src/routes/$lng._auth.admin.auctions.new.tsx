import { createFileRoute } from "@tanstack/react-router";
import { AdminAuctionCreatePage } from "@/features/admin/auction-management/pages/AdminAuctionCreatePage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/auctions/new")({
    component: AdminAuctionCreateRoute,
});

function AdminAuctionCreateRoute() {
    const { lng } = Route.useParams();
    return <AdminAuctionCreatePage language={lng} />;
}
