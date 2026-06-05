import { createFileRoute } from "@tanstack/react-router";
import {
    OAuthAuthorizeRouteComponent,
    oauthAuthorizeSearchSchema,
} from "@/features/oauth/pages/OAuthAuthorizeRoute.tsx";

export const Route = createFileRoute("/_auth/oauth/authorize")({
    ssr: false,
    head: () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    }),
    validateSearch: (search: Record<string, unknown>) => oauthAuthorizeSearchSchema.parse(search),
    component: RouteComponent,
});

function RouteComponent() {
    const searchParams = Route.useSearch();
    return <OAuthAuthorizeRouteComponent searchParams={searchParams} />;
}
