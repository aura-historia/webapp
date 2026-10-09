import { createFileRoute } from "@tanstack/react-router";
import i18n from "@/i18n/i18n.ts";
import {
    adminListingSourceListQueryOptions,
    createAdminListingSourceErrorFactory,
} from "@/features/admin/listing-source-management/api/useAdminListingSources.ts";
import { AdminListingSourcesPage } from "@/features/admin/listing-source-management/pages/AdminListingSourcesPage.tsx";

export const Route = createFileRoute("/$lng/_auth/admin/listing-sources")({
    // The backend enforces admin authorization; prefetch failures fall back to the client query.
    loader: ({ context: { queryClient }, params: { lng } }) =>
        queryClient.prefetchInfiniteQuery(
            adminListingSourceListQueryOptions(
                {},
                createAdminListingSourceErrorFactory(i18n.getFixedT(lng)),
            ),
        ),
    component: AdminListingSourcesPage,
});
