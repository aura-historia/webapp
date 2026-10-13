import { createFileRoute } from "@tanstack/react-router";
import { AdminProductListingDetailPage } from "@/features/admin/product-listing-management/pages/AdminProductListingDetailPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/product-listings/$productListingId")({
    component: AdminProductListingDetailRoute,
});

function AdminProductListingDetailRoute() {
    const { productListingId, lng } = Route.useParams();
    return <AdminProductListingDetailPage productListingId={productListingId} language={lng} />;
}
