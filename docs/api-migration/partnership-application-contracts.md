# Own partnership applications

Issue #986 / MIG-15. Backend develop rechecked on 2026-10-02: swagger.yaml Git blob `d83b75c7827b85031fa10db7c9e1dfd503f6f73a`.

- List/read/create use `/me/partnership-applications`; the own response contains only `id`, `state`, and `proposal`.
- `OwnPartnershipApplication.ts` maps own DTOs into a separate domain model. Admin data is never requested to enrich applicant views. No timestamps, applicant IDs, approval linkage, or execution state are inferred.
- POST sends `{ proposal }`. Existing proposals send `{ type: "EXISTING_LISTING_SOURCE", listingSourceId }`, selected from `searchPublicListingSources` using the canonical ID, never the navigation slug. Public discovery does not establish ownership, access, or a grant.
- Proposed proposals send `{ type: "PROPOSED_LISTING_SOURCE", party, listingSource }`. Party fields are name and optional phone/email; source fields are name, optional URL/image, and requested ingestion methods. Empty optional values are omitted; an empty methods array is supported by the schema. There is no address, domain, or shop-type collection.
- Submitted proposals are immutable. Applicants can withdraw SUBMITTED or IN_REVIEW applications through DELETE. A 204 updates the cached state to WITHDRAWN and refreshes list/detail; it does not remove the proposal. A 409 shows a localized conflict and refreshes authoritative state without claiming success. A read/withdrawal 404 displays unavailable application; a creation 404 asks the applicant to select another listing source.
- Custom integration eligibility uses only pending own states. Approval is not itself a source grant; the granted-source list is owned by MIG-14.
- Privacy copy in all five locales describes the proposal fields and removed address collection. No additional persistence, logging, analytics, or processors were added.
