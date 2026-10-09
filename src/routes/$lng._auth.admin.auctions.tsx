import { createFileRoute } from "@tanstack/react-router";
import { AdminAuctionsPage } from "@/features/auction-discovery/pages/AdminAuctionsPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/admin/auctions")({
    head: ({ params }) =>
        generatePageHeadMeta({
            pageKey: "adminAuctions",
            noIndex: true,
            language: params.lng,
        }),
    component: AdminAuctionsRoute,
});

function AdminAuctionsRoute() {
    const { lng } = Route.useParams();
    return <AdminAuctionsPage language={lng} />;
}
