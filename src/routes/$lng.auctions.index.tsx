import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import { AuctionDirectoryPage } from "@/features/auction-discovery/pages/AuctionDirectoryPage.tsx";
import {
    auctionDirectoryQueryOptions,
    createAuctionErrorFactory,
} from "@/features/auction-discovery/api/useAuctions.ts";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";
import { env } from "@/env.ts";

export const Route = createFileRoute("/$lng/auctions/")({
    loader: ({ context: { queryClient }, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            auctionDirectoryQueryOptions({}, createAuctionErrorFactory(i18n.getFixedT(lng))),
        ),
    head: ({ params }) =>
        generatePageHeadMeta({
            pageKey: "auctions",
            url: `${env.VITE_APP_URL}/auctions`,
            language: params.lng,
        }),
    component: AuctionDirectoryPage,
});
