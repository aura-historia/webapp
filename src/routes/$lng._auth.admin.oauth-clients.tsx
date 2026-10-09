import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminOAuthClientListQueryOptions,
    createAdminOAuthClientErrorFactory,
} from "@/features/admin/oauth-client-management/api/useAdminOAuthClients.ts";
import { AdminOAuthClientsPage } from "@/features/admin/oauth-client-management/pages/AdminOAuthClientsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/oauth-clients")({
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            adminOAuthClientListQueryOptions(
                {},
                createAdminOAuthClientErrorFactory(i18n.getFixedT(lng)),
            ),
        ),
    component: AdminOAuthClientsPage,
});
