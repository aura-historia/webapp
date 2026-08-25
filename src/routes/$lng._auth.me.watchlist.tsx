import { createFileRoute } from "@tanstack/react-router";
import { WatchlistPage } from "@/features/watchlist/pages/WatchlistPage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

export const Route = createFileRoute("/$lng/_auth/me/watchlist")({
    head: () =>
        generatePageHeadMeta({
            pageKey: "watchlist",
            noIndex: true,
        }),
    component: WatchlistPage,
});
