import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/start-client-core";
import { postOAuthAuthorizeApprove } from "@/features/oauth/api/oauthAuthorizeApproveHandler.ts";

export const Route = createFileRoute("/api/oauth/authorize/approve")({
    server: {
        handlers: {
            POST: postOAuthAuthorizeApprove,
        },
    },
});
