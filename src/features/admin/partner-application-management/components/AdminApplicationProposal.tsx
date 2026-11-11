import { useTranslation } from "react-i18next";
import type { PartnershipProposal } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { ADMIN_INSET_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";

type ProposalRow = {
    readonly key: string;
    readonly label: string;
    readonly value?: string;
    readonly mono?: boolean;
};

/** Read-only proposal; proposals are immutable after submission. URLs stay plain text. */
export function AdminApplicationProposal({ proposal }: { readonly proposal: PartnershipProposal }) {
    const { t } = useTranslation();
    const rows: readonly ProposalRow[] =
        proposal.type === "EXISTING_LISTING_SOURCE"
            ? [
                  {
                      key: "listingSourceId",
                      label: t("adminApplications.proposal.listingSourceId"),
                      value: proposal.listingSourceId,
                      mono: true,
                  },
              ]
            : [
                  {
                      key: "provider",
                      label: t("adminApplications.proposal.provider"),
                      value: proposal.listingSource.name,
                  },
                  {
                      key: "type",
                      label: t("adminApplications.proposal.type"),
                      value: t(`listingSourceTypes.${proposal.listingSource.listingSourceType}`),
                  },
                  {
                      key: "website",
                      label: t("adminApplications.proposal.website"),
                      value: proposal.listingSource.url,
                  },
                  {
                      key: "image",
                      label: t("adminApplications.proposal.image"),
                      value: proposal.listingSource.image,
                  },
                  {
                      key: "organization",
                      label: t("adminApplications.proposal.organization"),
                      value: proposal.party.name,
                  },
                  {
                      key: "phone",
                      label: t("adminApplications.proposal.partyPhone"),
                      value: proposal.party.phone,
                  },
                  {
                      key: "email",
                      label: t("adminApplications.proposal.partyEmail"),
                      value: proposal.party.email,
                  },
                  {
                      key: "ingestion",
                      label: t("adminApplications.proposal.ingestion"),
                      value:
                          proposal.listingSource.requestedIngestionMethods
                              .map((method) =>
                                  t(`partnerApplications.proposals.ingestion.${method}`),
                              )
                              .join(", ") || t("partnerApplications.proposals.noMethods"),
                  },
              ];
    return (
        <div className={cn(ADMIN_INSET_CLASS, "px-[18px] py-1")}>
            <dl>
                {rows.map((row) => (
                    <div
                        key={row.key}
                        className="grid gap-1 border-b border-line-subtle py-[11px] last:border-b-0 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-baseline sm:gap-4"
                    >
                        <dt className="text-meta text-ink-secondary">{row.label}</dt>
                        <dd
                            className={cn(
                                "text-sm [overflow-wrap:anywhere]",
                                row.mono && "font-mono text-xs",
                                row.value ? "text-ink" : "text-ink-muted",
                            )}
                        >
                            {row.value || t("adminCommon.none")}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
