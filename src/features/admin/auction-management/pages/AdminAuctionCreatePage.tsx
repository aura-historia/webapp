import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    AdminBackLink,
    AdminRecordHeader,
} from "@/features/admin/common/components/AdminPageHeader.tsx";
import { ADMIN_RAISED_FIELD_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { FormField } from "@/features/admin/product-listing-management/components/AdminProductListingPresentation.tsx";
import type { AdminListingSourceSummary } from "@/data/internal/listing-source/AdminListingSource.ts";
import { cn } from "@/lib/utils.ts";
import {
    AdminAuctionRequestError,
    type AuctionMetadataValues,
    useCreateAdminAuction,
} from "../api/useAdminAuctions.ts";
import { AuctionListingSourcePicker } from "../components/AuctionListingSourcePicker.tsx";
import { AuctionMetadataFields, AuctionSection } from "../components/AuctionMetadataFields.tsx";
import { AuctionFormActions, AuctionRequestAlert } from "../components/AuctionRecordParts.tsx";
import {
    auctionMetadataSchema,
    createDefaultAuctionMetadata,
    sourceAuctionIdSchema,
} from "../lib/auctionForm.ts";

export function AdminAuctionCreatePage({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const form = useForm<AuctionMetadataValues>({
        resolver: zodResolver(auctionMetadataSchema),
        defaultValues: createDefaultAuctionMetadata(language),
    });
    const [selectedSource, setSelectedSource] = useState<AdminListingSourceSummary>();
    const [sourceAuctionId, setSourceAuctionId] = useState("");
    const [sourceError, setSourceError] = useState<string>();
    const [sourceAuctionIdError, setSourceAuctionIdError] = useState<string>();
    const createAuction = useCreateAdminAuction();
    // A duplicate key can be looked up exactly by the submitted source and source auction ID.
    const conflictingKey =
        createAuction.error instanceof AdminAuctionRequestError &&
        createAuction.error.status === 409 &&
        createAuction.variables
            ? {
                  listingSource: createAuction.variables.listingSourceId,
                  sourceAuctionId: createAuction.variables.sourceAuctionId.trim(),
              }
            : undefined;

    const submit = form.handleSubmit(async (values) => {
        const sourceId = sourceAuctionIdSchema.safeParse(sourceAuctionId);
        setSourceError(selectedSource ? undefined : "adminAuctions.validation.sourceRequired");
        setSourceAuctionIdError(sourceId.success ? undefined : sourceId.error.issues[0]?.message);
        if (!selectedSource || !sourceId.success) return;
        try {
            const auction = await createAuction.mutateAsync({
                ...values,
                listingSourceId: selectedSource.listingSourceId,
                sourceAuctionId: sourceId.data,
            });
            toast.success(t("adminAuctions.toasts.created"));
            await navigate({
                to: "/$lng/admin/auctions/$auctionId",
                params: { lng: language, auctionId: auction.auctionId },
            });
        } catch {
            // The mutation exposes a localized, status-based error below.
        }
    });

    return (
        <div className="flex max-w-[860px] flex-col">
            <AdminRecordHeader
                back={
                    <AdminBackLink to="/$lng/admin/auctions" params={{ lng: language }}>
                        {t("adminAuctions.actions.allAuctions")}
                    </AdminBackLink>
                }
                title={t("adminAuctions.create.heading")}
            />
            <form noValidate onSubmit={submit} className="flex flex-col gap-7">
                <AuctionSection
                    title={`01 · ${t("adminAuctions.sections.identity")}`}
                    ruled={false}
                >
                    <AuctionListingSourcePicker
                        value={selectedSource}
                        onChange={(source) => {
                            setSelectedSource(source);
                            if (source) setSourceError(undefined);
                        }}
                        error={sourceError}
                    />
                    <FormField
                        id="auction-source-auction-id"
                        label={t("adminAuctions.fields.sourceAuctionId")}
                        error={sourceAuctionIdError}
                    >
                        <input
                            id="auction-source-auction-id"
                            autoComplete="off"
                            spellCheck={false}
                            value={sourceAuctionId}
                            aria-invalid={sourceAuctionIdError || conflictingKey ? true : undefined}
                            aria-describedby={sourceAuctionIdDescription(
                                Boolean(sourceAuctionIdError),
                                Boolean(conflictingKey),
                            )}
                            onChange={(event) => {
                                setSourceAuctionId(event.currentTarget.value);
                                setSourceAuctionIdError(undefined);
                            }}
                            className={cn(ADMIN_RAISED_FIELD_CLASS, "font-mono text-sm")}
                        />
                    </FormField>
                    {conflictingKey && (
                        <p
                            id="auction-duplicate"
                            role="alert"
                            className="flex flex-wrap items-center gap-2 text-sm leading-normal text-oxblood"
                        >
                            <CircleAlert
                                aria-hidden="true"
                                className="size-[15px] shrink-0"
                                strokeWidth={2}
                            />
                            {t("adminAuctions.errors.duplicateShort")}
                            <Link
                                to="/$lng/admin/auctions"
                                params={{ lng: language }}
                                search={conflictingKey}
                                className="font-medium text-ink underline decoration-line-strong underline-offset-3 hover:decoration-current"
                            >
                                {t("adminAuctions.actions.openExisting")}
                            </Link>
                        </p>
                    )}
                </AuctionSection>
                <AuctionMetadataFields form={form} />
                {createAuction.error && !conflictingKey && (
                    <AuctionRequestAlert error={createAuction.error} />
                )}
                <AuctionFormActions
                    language={language}
                    pending={createAuction.isPending}
                    label={t("adminAuctions.actions.create")}
                    pendingLabel={t("adminAuctions.actions.creating")}
                />
            </form>
        </div>
    );
}

/** The element describing the source auction ID field: its own error first, then a duplicate. */
function sourceAuctionIdDescription(hasError: boolean, isDuplicate: boolean): string | undefined {
    if (hasError) return "auction-source-auction-id-error";
    if (isDuplicate) return "auction-duplicate";
    return undefined;
}
