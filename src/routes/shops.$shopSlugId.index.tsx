import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getShopBySlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapToShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { generateShopHeadMeta } from "@/lib/seo/shop/shopHeadMeta.ts";
import { ShopPageSkeleton } from "@/components/shop/ShopPageSkeleton.tsx";
import { ShopHeader } from "@/components/shop/ShopHeader.tsx";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid.tsx";
import { ShopLocationSection } from "@/components/shop/ShopLocationSection.tsx";
import { useCallback, useMemo, useState } from "react";
import { isApiNotFoundError } from "@/lib/api/apiError.ts";

export const Route = createFileRoute("/shops/$shopSlugId/")({
    loader: async ({ context: { queryClient }, params: { shopSlugId } }) => {
        try {
            return await queryClient.ensureQueryData(
                getShopBySlugOptions({
                    path: { shopSlugId },
                }),
            );
        } catch (error) {
            if (isApiNotFoundError(error)) {
                throw notFound();
            }

            throw error;
        }
    },
    head: ({ loaderData, params }) => generateShopHeadMeta(loaderData, params),
    pendingComponent: ShopPageSkeleton,
    component: ShopDetailComponent,
});

function ShopDetailComponent() {
    const { shopSlugId } = Route.useParams();
    const [productCount, setProductCount] = useState<number | undefined>(undefined);

    const { data } = useSuspenseQuery(
        getShopBySlugOptions({
            path: { shopSlugId },
        }),
    );

    const shop = useMemo(() => mapToShopDetail(data), [data]);

    const handleTotalChange = useCallback((total: number | undefined) => {
        setProductCount(total);
    }, []);

    return (
        <div className="bg-background">
            <ShopHeader shop={shop} productCount={productCount} />
            <ShopLocationSection shop={shop} />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-10">
                <ShopProductGrid
                    shopName={shop.name}
                    shopType={shop.shopType}
                    onTotalChange={handleTotalChange}
                />
            </div>
        </div>
    );
}
