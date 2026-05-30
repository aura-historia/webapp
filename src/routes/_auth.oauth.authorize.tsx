import { createFileRoute } from "@tanstack/react-router";
import { OAuthAuthorizePage } from "@/components/oauth/OAuthAuthorizePage.tsx";
import { z } from "zod";

const oauthAuthorizeSearchSchema = z.object({
    response_type: z.string().default("code"),
    client_id: z.string(),
    redirect_uri: z.string(),
    scope: z.string().optional(),
    state: z.string().optional(),
    code_challenge: z.string(),
    code_challenge_method: z.string().default("S256"),
});

export const Route = createFileRoute("/_auth/oauth/authorize")({
    ssr: false,
    head: () => ({
        meta: [{ name: "robots", content: "noindex, nofollow" }],
    }),
    validateSearch: (search: Record<string, unknown>) => oauthAuthorizeSearchSchema.parse(search),
    component: OAuthAuthorizeRouteComponent,
});

function OAuthAuthorizeRouteComponent() {
    const searchParams = Route.useSearch();
    return <OAuthAuthorizePage searchParams={searchParams} />;
}
