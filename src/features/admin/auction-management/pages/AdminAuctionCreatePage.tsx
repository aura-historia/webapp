import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { AuctionMetadataValues } from "../api/useAdminAuctions.ts";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminListingSourceSummary } from "@/data/internal/listing-source/AdminListingSource.ts";
import { AdminAuctionRequestError, useCreateAdminAuction } from "../api/useAdminAuctions.ts";
import { AuctionListingSourcePicker } from "../components/AuctionListingSourcePicker.tsx";
import { AuctionMetadataFields } from "../components/AuctionMetadataFields.tsx";
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

    return (
        <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-10 sm:px-6">
            <header className="grid gap-2">
                <H1>{t("adminAuctions.create.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">
                    {t("adminAuctions.create.description")}
                </p>
            </header>
            <form
                className="grid gap-6 border bg-card p-5 sm:p-7"
                onSubmit={form.handleSubmit(async (values) => {
                    if (!selectedSource) {
                        setSourceError("adminAuctions.validation.sourceRequired");
                        return;
                    }
                    const sourceId = sourceAuctionIdSchema.safeParse(sourceAuctionId);
                    if (!sourceId.success) {
                        setSourceAuctionIdError(sourceId.error.issues[0]?.message);
                        return;
                    }
                    setSourceError(undefined);
                    setSourceAuctionIdError(undefined);
                    try {
                        const auction = await createAuction.mutateAsync({
                            ...values,
                            listingSourceId: selectedSource.listingSourceId,
                            sourceAuctionId: sourceId.data,
                        });
                        await navigate({
                            to: "/$lng/admin/auctions/$auctionId",
                            params: { lng: language, auctionId: auction.auctionId },
                        });
                    } catch {
                        // The mutation exposes a localized, status-based error below.
                    }
                })}
            >
                <AuctionListingSourcePicker
                    value={selectedSource}
                    onChange={(source) => {
                        setSelectedSource(source);
                        if (source) setSourceError(undefined);
                    }}
                    error={sourceError}
                />

                <div className="grid gap-2">
                    <Label htmlFor="auction-source-auction-id">
                        {t("adminAuctions.fields.sourceAuctionId")}
                    </Label>
                    <Input
                        id="auction-source-auction-id"
                        autoComplete="off"
                        value={sourceAuctionId}
                        onChange={(event) => {
                            setSourceAuctionId(event.currentTarget.value);
                            setSourceAuctionIdError(undefined);
                        }}
                    />
                    <p className="text-sm text-muted-foreground">
                        {t("adminAuctions.fields.sourceAuctionIdHelp")}
                    </p>
                    {sourceAuctionIdError && (
                        <p role="alert" className="text-sm text-destructive">
                            {t(sourceAuctionIdError)}
                        </p>
                    )}
                </div>

                <AuctionMetadataFields form={form} />
                <p className="text-sm text-muted-foreground">
                    {t("adminAuctions.create.blankFieldsHelp")}
                </p>
                {createAuction.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {createAuction.error instanceof AdminAuctionRequestError
                            ? createAuction.error.message
                            : t("adminAuctions.errors.requestFailed")}
                    </p>
                )}
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            navigate({ to: "/$lng/admin/auctions", params: { lng: language } })
                        }
                    >
                        {t("adminAuctions.actions.cancel")}
                    </Button>
                    <Button type="submit" disabled={createAuction.isPending}>
                        {createAuction.isPending
                            ? t("adminAuctions.actions.creating")
                            : t("adminAuctions.actions.create")}
                    </Button>
                </div>
            </form>
        </main>
    );
}
