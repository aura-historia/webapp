import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminPartyListQueryOptions,
    createAdminPartyErrorFactory,
} from "@/features/admin/party-management/api/useAdminParties.ts";
import { AdminPartiesPage } from "@/features/admin/party-management/pages/AdminPartiesPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/parties")({
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            adminPartyListQueryOptions({}, createAdminPartyErrorFactory(i18n.getFixedT(lng))),
        ),
    component: AdminPartiesPage,
});
