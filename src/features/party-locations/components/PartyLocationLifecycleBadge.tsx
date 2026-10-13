import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge.tsx";
import type { PartyLocation } from "@/data/internal/geography/PartyLocation.ts";

export function PartyLocationLifecycleBadge({
    lifecycle,
}: {
    readonly lifecycle: PartyLocation["lifecycle"];
}) {
    const { t } = useTranslation();
    return (
        <Badge variant={lifecycle === "ACTIVE" ? "secondary" : "outline"}>
            {t(`partyLocations.lifecycle.${lifecycle}`)}
        </Badge>
    );
}
