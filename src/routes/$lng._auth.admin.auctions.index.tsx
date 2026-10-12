import { createFileRoute } from "@tanstack/react-router";
import {
    toAdminAuctionFilters,
    toAdminAuctionRouteSearch,
    validateAdminAuctionSearch,
} from "@/features/admin/auction-management/lib/adminAuctionSearch.ts";
import { AdminAuctionsPage } from "@/features/admin/auction-management/pages/AdminAuctionsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/auctions/")({
    validateSearch: validateAdminAuctionSearch,
    component: AdminAuctionsRoute,
});

function AdminAuctionsRoute() {
    const { lng } = Route.useParams();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    return (
        <AdminAuctionsPage
            language={lng}
            filters={toAdminAuctionFilters(search)}
            onFiltersChange={(filters) =>
                navigate({ search: toAdminAuctionRouteSearch(filters), replace: true })
            }
        />
    );
}
