import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { AuctionMetadataValues } from "../api/useAuctions.ts";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminListingSourceSummary } from "@/data/internal/listing-source/AdminListingSource.ts";
import {
    AuctionRequestError,
    useAdminAuctionListingSources,
    useCreateAdminAuction,
} from "../api/useAuctions.ts";
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
    const [sourceQuery, setSourceQuery] = useState("");
    const [selectedSource, setSelectedSource] = useState<AdminListingSourceSummary>();
    const [sourceAuctionId, setSourceAuctionId] = useState("");
    const [sourceError, setSourceError] = useState<string>();
    const [sourceAuctionIdError, setSourceAuctionIdError] = useState<string>();
    const sourceSearch = useAdminAuctionListingSources(sourceQuery);
    const createAuction = useCreateAdminAuction();
    const sources = sourceSearch.data?.pages.flatMap((page) => page.items) ?? [];

    const selectSource = (source?: AdminListingSourceSummary) => {
        setSelectedSource(source);
        setSourceError(source ? undefined : "adminAuctions.validation.sourceRequired");
    };

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
                <fieldset className="grid gap-3">
                    <legend className="font-medium">
                        {t("adminAuctions.fields.listingSource")}
                    </legend>
                    {selectedSource ? (
                        <div className="grid gap-2 border bg-surface-container-low p-4">
                            <p className="font-medium">{selectedSource.name}</p>
                            <p className="break-all font-mono text-xs text-muted-foreground">
                                {selectedSource.listingSourceId}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-fit"
                                onClick={() => selectSource()}
                            >
                                {t("adminAuctions.actions.changeSource")}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="auction-source-search">
                                    {t("adminAuctions.fields.searchListingSources")}
                                </Label>
                                <Input
                                    id="auction-source-search"
                                    type="search"
                                    autoComplete="off"
                                    value={sourceQuery}
                                    onChange={(event) => setSourceQuery(event.currentTarget.value)}
                                />
                            </div>
                            {sourceQuery.trim() === "" ? (
                                <p className="text-sm text-muted-foreground">
                                    {t("adminAuctions.sourceSearch.prompt")}
                                </p>
                            ) : sourceSearch.isPending ? (
                                <p role="status" className="text-sm text-muted-foreground">
                                    {t("adminAuctions.sourceSearch.loading")}
                                </p>
                            ) : sourceSearch.error ? (
                                <div className="grid justify-items-start gap-2" role="alert">
                                    <p className="text-sm text-destructive">
                                        {sourceSearch.error.message}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => sourceSearch.refetch()}
                                    >
                                        {t("adminAuctions.actions.retry")}
                                    </Button>
                                </div>
                            ) : sources.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t("adminAuctions.sourceSearch.noResults")}
                                </p>
                            ) : (
                                <>
                                    <ul className="grid gap-2">
                                        {sources.map((source) => (
                                            <li key={source.listingSourceId}>
                                                <button
                                                    type="button"
                                                    className="grid w-full gap-1 border bg-surface-container-low p-3 text-left outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring"
                                                    onClick={() => selectSource(source)}
                                                >
                                                    <span className="font-medium">
                                                        {source.name}
                                                    </span>
                                                    <span className="break-all font-mono text-xs text-muted-foreground">
                                                        {source.listingSourceId} ·{" "}
                                                        {source.listingSourceSlugId}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    {sourceSearch.hasNextPage && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="justify-self-center"
                                            disabled={sourceSearch.isFetchingNextPage}
                                            onClick={() => sourceSearch.fetchNextPage()}
                                        >
                                            {sourceSearch.isFetchingNextPage
                                                ? t("adminAuctions.actions.loadingMore")
                                                : t("adminAuctions.actions.loadMore")}
                                        </Button>
                                    )}
                                </>
                            )}
                        </>
                    )}
                    {sourceError && (
                        <p role="alert" className="text-sm text-destructive">
                            {t(sourceError)}
                        </p>
                    )}
                </fieldset>

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
                        {createAuction.error instanceof AuctionRequestError
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
