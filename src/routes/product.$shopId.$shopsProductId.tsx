import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getProductOptions } from "@/client/@tanstack/react-query.gen";
import { mapToDetailProduct } from "@/data/internal/ProductDetails";
import { ProductDetailPage } from "@/components/product/detail/ProductDetailPage.tsx";
import { ProductDetailPageSkeleton } from "@/components/product/detail/ProductDetailPageSkeleton.tsx";

export const Route = createFileRoute("/product/$shopId/$shopsProductId")({
    loader: ({ context: { queryClient }, params: { shopId, shopsProductId } }) => {
        return queryClient.ensureQueryData(
            getProductOptions({
                path: { shopId, shopsProductId },
                query: { history: true },
            }),
        );
    },
    pendingComponent: ProductDetailPageSkeleton,
    component: ProductDetailComponent,
});

function ProductDetailComponent() {
    const { shopId, shopsProductId } = Route.useParams();

    const { data: apiData } = useSuspenseQuery(
        getProductOptions({
            path: { shopId, shopsProductId },
            query: { history: true },
        }),
    );

    const item = mapToDetailProduct(apiData);

    return <ProductDetailPage item={item} />;
}
