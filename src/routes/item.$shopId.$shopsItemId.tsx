import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getItemOptions } from "@/client/@tanstack/react-query.gen";
import { mapToDetailItem } from "@/data/internal/ItemDetails";
import { ItemDetailPage } from "@/components/item/detail/ItemDetailPage.tsx";
import { ItemDetailPageSkeleton } from "@/components/item/detail/ItemDetailPageSkeleton.tsx";

export const Route = createFileRoute("/item/$shopId/$shopsItemId")({
    loader: ({ context: { queryClient }, params: { shopId, shopsItemId } }) => {
        return queryClient.ensureQueryData(
            getItemOptions({
                path: { shopId, shopsItemId },
                query: { history: true },
            }),
        );
    },
    pendingComponent: ItemDetailPageSkeleton,
    component: ItemDetailComponent,
});

function ItemDetailComponent() {
    const { shopId, shopsItemId } = Route.useParams();

    const { data: apiData } = useSuspenseQuery(
        getItemOptions({
            path: { shopId, shopsItemId },
            query: { history: true },
        }),
    );

    const item = mapToDetailItem(apiData);

    return <ItemDetailPage item={item} />;
}
