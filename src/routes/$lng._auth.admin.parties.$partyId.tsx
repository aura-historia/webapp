import { createFileRoute } from "@tanstack/react-router";
import { AdminPartyDetailPage } from "@/features/admin/party-management/pages/AdminPartyDetailPage.tsx";

// Protected, viewer-scoped Party-location reads run on the client only; there is no loader.
export const Route = createFileRoute("/$lng/_auth/admin/parties/$partyId")({
    component: AdminPartyDetailRoute,
});

function AdminPartyDetailRoute() {
    const { partyId, lng } = Route.useParams();
    return <AdminPartyDetailPage key={partyId} partyId={partyId} language={lng} />;
}
