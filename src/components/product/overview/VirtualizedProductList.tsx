import { ProductCard } from "./ProductCard.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";

type VirtualizedProductListProps = {
    readonly products: OverviewProduct[];
    readonly hasNextPage?: boolean;
    readonly isFetchingNextPage?: boolean;
    readonly fetchNextPage?: () => void;
};

export function VirtualizedProductList({ products }: VirtualizedProductListProps) {
    return (
        <>
            {products.map((product: OverviewProduct) => (
                <ProductCard key={product.productId} product={product} />
            ))}
        </>
    );
}
