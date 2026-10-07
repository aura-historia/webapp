import type { AdminApplicationFilters } from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { AdminPartnershipApplicationsSection } from "../components/AdminPartnershipApplicationsSection.tsx";

export function AdminPartnershipApplicationsPage({
    filters,
    onFiltersChange,
}: {
    readonly filters: AdminApplicationFilters;
    readonly onFiltersChange: (filters: AdminApplicationFilters) => void;
}) {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            <AdminPartnershipApplicationsSection
                filters={filters}
                onFiltersChange={onFiltersChange}
            />
        </div>
    );
}
