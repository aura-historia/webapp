import { createFileRoute } from "@tanstack/react-router";
import { AdminAuctionDetailPage } from "@/features/admin/auction-management/pages/AdminAuctionDetailPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/auctions/$auctionId")({
    component: AdminAuctionDetailRoute,
});

function AdminAuctionDetailRoute() {
    const { auctionId, lng } = Route.useParams();
    return <AdminAuctionDetailPage auctionId={auctionId} language={lng} />;
}
