import { useTranslation } from "react-i18next";
import type { PartnershipProposal } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";

/** Read-only proposal view; proposals are immutable after submission. */
export function AdminApplicationProposal({ proposal }: { readonly proposal: PartnershipProposal }) {
    const { t } = useTranslation();
    const rows: ReadonlyArray<readonly [string, string | undefined]> =
        proposal.type === "EXISTING_LISTING_SOURCE"
            ? [["listingSourceId", proposal.listingSourceId]]
            : [
                  ["partyName", proposal.party.name],
                  ["partyPhone", proposal.party.phone],
                  ["partyEmail", proposal.party.email],
                  ["sourceName", proposal.listingSource.name],
                  ["sourceUrl", proposal.listingSource.url],
                  ["sourceImage", proposal.listingSource.image],
                  [
                      "methods",
                      proposal.listingSource.requestedIngestionMethods
                          .map((method) => t(`partnerApplications.proposals.ingestion.${method}`))
                          .join(", ") || t("partnerApplications.proposals.noMethods"),
                  ],
              ];
    return (
        <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map(([key, value]) =>
                value ? (
                    <div key={key} className="min-w-0">
                        <dt className="text-sm text-muted-foreground">
                            {t(`adminApplications.proposal.${key}`)}
                        </dt>
                        <dd
                            className={
                                key === "listingSourceId" ? "break-all font-mono" : "break-all"
                            }
                        >
                            {value}
                        </dd>
                    </div>
                ) : null,
            )}
        </dl>
    );
}
