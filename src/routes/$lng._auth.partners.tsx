import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PartnerLayout } from "@/features/partner/common/components/PartnerLayout.tsx";

export const Route = createFileRoute("/$lng/_auth/partners")({
    component: PartnerRoutesComponent,
});

function PartnerRoutesComponent() {
    return (
        <PartnerLayout>
            <Outlet />
        </PartnerLayout>
    );
}
