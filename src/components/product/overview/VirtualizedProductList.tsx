import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard.tsx";
import type { OverviewProduct } from "@/data/internal/product/OverviewProduct.ts";

type VirtualizedProductListProps = {
    readonly products: OverviewProduct[];
    readonly hasNextPage?: boolean;
    readonly isFetchingNextPage?: boolean;
    readonly fetchNextPage?: () => void;
};

export function VirtualizedProductList({
    products,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: VirtualizedProductListProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: products.length,
        getScrollElement: () => window,
        estimateSize: () => 250, // Estimated height of a ProductCard
        overscan: 5, // Render 5 extra items above and below visible area
        measureElement:
            typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
                ? (element) => element?.getBoundingClientRect().height
                : undefined,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    // Trigger next page when scrolling near the end
    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (
            lastItem &&
            lastItem.index >= products.length - 3 &&
            hasNextPage &&
            !isFetchingNextPage &&
            fetchNextPage
        ) {
            fetchNextPage();
        }
    }, [virtualItems, products.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div ref={parentRef} className="flex flex-col">
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: "relative",
                }}
            >
                {virtualItems.map((virtualItem) => {
                    const product = products[virtualItem.index];
                    return (
                        <div
                            key={product.productId}
                            data-index={virtualItem.index}
                            data-testid={`product-card-${product.productId}`}
                            ref={rowVirtualizer.measureElement}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                            className="pb-4"
                        >
                            <ProductCard product={product} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
