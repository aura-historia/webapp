import { createFileRoute } from "@tanstack/react-router";
import {
    toAdminProductListingFilters,
    toAdminProductListingRouteSearch,
    validateAdminProductListingSearch,
} from "@/features/admin/product-listing-management/lib/adminProductListingSearch.ts";
import { AdminProductListingsPage } from "@/features/admin/product-listing-management/pages/AdminProductListingsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/product-listings/")({
    validateSearch: validateAdminProductListingSearch,
    component: AdminProductListingsRoute,
});

function AdminProductListingsRoute() {
    const { lng } = Route.useParams();
    const search = Route.useSearch();
    const navigate = Route.useNavigate();

    return (
        <AdminProductListingsPage
            language={lng}
            filters={toAdminProductListingFilters(search)}
            onFiltersChange={(filters) =>
                navigate({ search: toAdminProductListingRouteSearch(filters), replace: true })
            }
        />
    );
}
