import { useNavigate, useSearch } from "@tanstack/react-router";
import { PartnerApplicationsSection } from "../components/PartnerApplicationsSection.tsx";

export function PartnerApplicationsPage() {
    const { create, provider } = useSearch({ from: "/$lng/_auth/partners/applications" });
    const navigate = useNavigate({ from: "/$lng/partners/applications" });
    return (
        <PartnerApplicationsSection
            createOpen={create === true ? true : undefined}
            createProviderSlug={provider}
            onCreateOpenChange={(open) => {
                if (!open && create) void navigate({ search: {}, replace: true });
            }}
        />
    );
}
