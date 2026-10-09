import { createFileRoute } from "@tanstack/react-router";
import { AdminAuctionCreatePage } from "@/features/auction-discovery/pages/AdminAuctionCreatePage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/admin/auctions/new")({
    head: ({ params }) =>
        generatePageHeadMeta({
            pageKey: "adminAuctionCreate",
            noIndex: true,
            language: params.lng,
        }),
    component: AdminAuctionCreateRoute,
});

function AdminAuctionCreateRoute() {
    const { lng } = Route.useParams();
    return <AdminAuctionCreatePage language={lng} />;
}
