import { createFileRoute } from "@tanstack/react-router";
import { AdminAuctionDetailPage } from "@/features/auction-discovery/pages/AdminAuctionDetailPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/admin/auctions/$auctionId")({
    head: ({ params }) =>
        generatePageHeadMeta({
            pageKey: "adminAuctions",
            noIndex: true,
            language: params.lng,
        }),
    component: AdminAuctionDetailRoute,
});

function AdminAuctionDetailRoute() {
    const { auctionId, lng } = Route.useParams();
    return <AdminAuctionDetailPage auctionId={auctionId} language={lng} />;
}
