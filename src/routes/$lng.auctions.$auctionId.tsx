import { createFileRoute, notFound } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { parseCurrency } from "@/data/internal/common/Currency.ts";
import {
    auctionCatalogueQueryOptions,
    auctionDetailQueryOptions,
    AuctionRequestError,
    createAuctionErrorFactory,
} from "@/features/auction-discovery/api/useAuctions.ts";
import { AuctionDetailPage } from "@/features/auction-discovery/pages/AuctionDetailPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env.ts";

export const Route = createFileRoute("/$lng/auctions/$auctionId")({
    loader: async ({
        context: { queryClient, initialPreferences },
        params: { lng, auctionId },
    }) => {
        const requestError = createAuctionErrorFactory(i18n.getFixedT(lng));
        const auction = await queryClient
            .ensureQueryData(auctionDetailQueryOptions(auctionId, requestError))
            .catch((error) => {
                if (error instanceof AuctionRequestError && error.status === 404) throw notFound();
                throw error;
            });

        await queryClient.prefetchInfiniteQuery(
            auctionCatalogueQueryOptions(
                auctionId,
                parseLanguage(lng),
                parseCurrency(initialPreferences.currency),
                requestError,
            ),
        );
        return auction;
    },
    head: ({ loaderData, params }) => {
        const t = i18n.getFixedT(params.lng);
        return generatePageHeadMeta({
            pageKey: "auctionDetail",
            title: loaderData?.name?.text
                ? t("meta.auctionDetail.titleWithName", { name: loaderData.name.text })
                : t("meta.auctionDetail.title"),
            description: t("meta.auctionDetail.description", {
                source: loaderData?.listingSource.name ?? "",
            }),
            url: `${env.VITE_APP_URL}/auctions/${params.auctionId}`,
            language: params.lng,
        });
    },
    component: AuctionDetailRoute,
});

function AuctionDetailRoute() {
    const { auctionId } = Route.useParams();
    return <AuctionDetailPage auctionId={auctionId} />;
}
