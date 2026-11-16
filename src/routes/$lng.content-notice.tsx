import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/env";
import { loadContentNoticeTarget } from "@/features/content-notice/api/contentNoticeTargetLoader.ts";
import { validateContentNoticeSearch } from "@/features/content-notice/lib/contentNoticeSearch.ts";
import { ContentNoticePage } from "@/features/content-notice/pages/ContentNoticePage.tsx";
import { generatePageHeadMeta } from "@/lib/seo/pageHeadMeta.ts";

// Public, dynamic and never prerendered (not in STATIC_PAGES): the target comes from the link's
// public slug. Nothing the person types reaches the URL, logs or analytics.
export const Route = createFileRoute("/$lng/content-notice")({
    validateSearch: validateContentNoticeSearch,
    loaderDeps: ({ search }) => ({ listing: search.listing, provider: search.provider }),
    loader: ({ context: { queryClient }, deps, params: { lng } }) =>
        loadContentNoticeTarget(queryClient, deps, lng),
    headers: () => ({
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
    }),
    head: () =>
        generatePageHeadMeta({
            pageKey: "contentNotice",
            url: `${env.VITE_APP_URL}/content-notice`,
            noIndex: true,
        }),
    component: ContentNoticeRoute,
});

function ContentNoticeRoute() {
    const data = Route.useLoaderData();
    const deps = Route.useLoaderDeps();
    // A new target resets the form and its state.
    return <ContentNoticePage key={`${deps.listing ?? ""}|${deps.provider ?? ""}`} data={data} />;
}
