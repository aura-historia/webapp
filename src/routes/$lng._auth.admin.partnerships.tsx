import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminPartnershipListQueryOptions,
    createAdminPartnershipErrorFactory,
} from "@/features/admin/partnership-management/api/useAdminPartnerships.ts";
import { AdminPartnershipsPage } from "@/features/admin/partnership-management/pages/AdminPartnershipsPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/partnerships")({
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            adminPartnershipListQueryOptions(
                {},
                createAdminPartnershipErrorFactory(i18n.getFixedT(lng)),
            ),
        ),
    component: AdminPartnershipsPage,
});
