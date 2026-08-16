import { createFileRoute } from "@tanstack/react-router";
import { oauthAuthorizeSearchSchema } from "@/features/oauth/lib/oauthAuthorizeSearchParams.ts";
import { OAuthAuthorizePage } from "@/features/oauth/pages/OAuthAuthorizePage.tsx";

export const Route = createFileRoute("/$lng/_auth/oauth/authorize")({
    ssr: false,
    head: () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    }),
    validateSearch: (search: Record<string, unknown>) => oauthAuthorizeSearchSchema.parse(search),
    component: RouteComponent,
});

function RouteComponent() {
    const searchParams = Route.useSearch();
    return <OAuthAuthorizePage searchParams={searchParams} />;
}
