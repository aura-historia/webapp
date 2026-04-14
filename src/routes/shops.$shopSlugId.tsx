import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getShopBySlugOptions } from "@/client/@tanstack/react-query.gen";
import { mapToShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { generateShopHeadMeta } from "@/lib/seo/shop/shopHeadMeta.ts";
import { NotFoundComponent } from "@/components/common/NotFoundComponent.tsx";
import { ShopPageSkeleton } from "@/components/shop/ShopPageSkeleton.tsx";
import { ShopHeader } from "@/components/shop/ShopHeader.tsx";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid.tsx";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/shops/$shopSlugId")({
    loader: async ({ context: { queryClient }, params: { shopSlugId } }) => {
        return await queryClient.ensureQueryData(
            getShopBySlugOptions({
                path: { shopSlugId },
            }),
        );
    },
    head: ({ loaderData, params }) => generateShopHeadMeta(loaderData, params),
    pendingComponent: ShopPageSkeleton,
    notFoundComponent: NotFoundComponent,
    errorComponent: NotFoundComponent,
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

    const shop = mapToShopDetail(data);

    const handleTotalChange = useCallback((total: number | undefined) => {
        setProductCount(total);
    }, []);

    return (
        <div className="bg-background">
            <ShopHeader shop={shop} productCount={productCount} />
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-10">
                <div aria-hidden="true" className="border-t border-border/30 hidden md:block" />
                <div className="pt-8">
                    <ShopProductGrid shopName={shop.name} onTotalChange={handleTotalChange} />
                </div>
            </div>
        </div>
    );
}
