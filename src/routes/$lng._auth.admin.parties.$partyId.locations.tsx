import { createFileRoute } from "@tanstack/react-router";
import { AdminPartyLocationsPage } from "@/features/admin/party-management/pages/AdminPartyLocationsPage.tsx";

// Protected, viewer-scoped Party-location reads run on the client only; there is no loader.
export const Route = createFileRoute("/$lng/_auth/admin/parties/$partyId/locations")({
    component: AdminPartyLocationsRoute,
});

function AdminPartyLocationsRoute() {
    const { partyId, lng } = Route.useParams();
    return <AdminPartyLocationsPage partyId={partyId} language={lng} />;
}
