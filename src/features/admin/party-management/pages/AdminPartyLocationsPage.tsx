import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { PartyLocationWorkspace } from "@/features/party-locations/components/PartyLocationWorkspace.tsx";
import { useAdminParty } from "../api/useAdminParties.ts";

export function AdminPartyLocationsPage({
    partyId,
    language,
}: {
    readonly partyId: string;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const { user } = useResolvedAuth();
    const partyQuery = useAdminParty(partyId);

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
            <Link
                to="/$lng/admin/parties"
                params={{ lng: language }}
                className="inline-flex w-fit items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
            >
                <ArrowLeft className="size-4" aria-hidden />
                {t("adminParties.locations.back")}
            </Link>
            <header className="grid gap-1">
                <H1>{t("adminParties.locations.title")}</H1>
                {partyQuery.data ? (
                    <p className="break-words text-muted-foreground">
                        {t("adminParties.locations.owner", { name: partyQuery.data.name })}
                    </p>
                ) : partyQuery.error ? (
                    <p role="alert" className="text-muted-foreground">
                        {partyQuery.error.message}
                    </p>
                ) : (
                    <Skeleton className="h-5 w-64" />
                )}
                <p className="break-all font-mono text-xs text-muted-foreground">{partyId}</p>
            </header>
            {user ? (
                <PartyLocationWorkspace scope={{ viewerCacheKey: user.userId, partyId }} />
            ) : (
                <Skeleton className="h-64 w-full" />
            )}
        </div>
    );
}
