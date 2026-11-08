import { useNavigate, useSearch } from "@tanstack/react-router";
import { AccessTokensSection } from "../components/AccessTokensSection.tsx";

export function AccessTokensPage() {
    const { create } = useSearch({ from: "/$lng/_auth/partners/access-tokens" });
    const navigate = useNavigate({ from: "/$lng/partners/access-tokens" });
    return (
        <AccessTokensSection
            createOpen={create === true ? true : undefined}
            onCreateOpenChange={(open) => {
                if (!open && create) void navigate({ search: {}, replace: true });
            }}
        />
    );
}
