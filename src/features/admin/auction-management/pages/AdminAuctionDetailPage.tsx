import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { formatDateTime } from "@/lib/utils.ts";
import {
    AdminAuctionRequestError,
    mapAdminAuctionFormValues,
    useAdminAuction,
    useUpdateAdminAuction,
    type AuctionUpdateValues,
} from "../api/useAdminAuctions.ts";
import { AuctionMetadataFields } from "../components/AuctionMetadataFields.tsx";
import { auctionMetadataSchema } from "../lib/auctionForm.ts";

export function AdminAuctionDetailPage({
    auctionId,
    language,
}: {
    readonly auctionId: string;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const auctionQuery = useAdminAuction(auctionId);

    if (auctionQuery.isPending) {
        return (
            <main
                className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-10 sm:px-6"
                aria-busy="true"
            >
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-[34rem] w-full" />
            </main>
        );
    }

    if (auctionQuery.error || !auctionQuery.data) {
        const isMissing =
            auctionQuery.error instanceof AdminAuctionRequestError &&
            auctionQuery.error.status === 404;
        return (
            <main className="mx-auto grid w-full max-w-4xl justify-items-start gap-4 px-4 py-10 sm:px-6">
                <BackToAuctions language={language} />
                <H1>
                    {isMissing
                        ? t("adminAuctions.errors.missing")
                        : t("adminAuctions.errors.requestFailed")}
                </H1>
                <p role="alert" className="text-muted-foreground">
                    {auctionQuery.error instanceof Error
                        ? auctionQuery.error.message
                        : t("adminAuctions.errors.requestFailed")}
                </p>
            </main>
        );
    }

    return (
        <AdminAuctionUpdateForm
            auction={auctionQuery.data}
            language={language}
            onRefetch={auctionQuery.refetch}
        />
    );
}

function AdminAuctionUpdateForm({
    auction,
    language,
    onRefetch,
}: {
    readonly auction: NonNullable<ReturnType<typeof useAdminAuction>["data"]>;
    readonly language: string;
    readonly onRefetch: ReturnType<typeof useAdminAuction>["refetch"];
}) {
    const { t, i18n } = useTranslation();
    const [expectedVersion, setExpectedVersion] = useState(auction.expectedVersion);
    const form = useForm<AuctionUpdateValues, undefined, AuctionUpdateValues>({
        resolver: zodResolver(auctionMetadataSchema),
        defaultValues: mapAdminAuctionFormValues(auction, language),
    });
    const updateAuction = useUpdateAdminAuction(auction.auctionId);
    const staleError =
        updateAuction.error instanceof AdminAuctionRequestError &&
        updateAuction.error.status === 409
            ? updateAuction.error
            : undefined;

    const reloadLatest = async () => {
        const result = await onRefetch();
        if (!result.data) return;
        form.reset(mapAdminAuctionFormValues(result.data, language));
        setExpectedVersion(result.data.expectedVersion);
        updateAuction.reset();
    };

    return (
        <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-10 sm:px-6">
            <header className="grid gap-2">
                <BackToAuctions language={language} />
                <H1>{t("adminAuctions.detail.title")}</H1>
                <p className="max-w-3xl text-muted-foreground">
                    {t("adminAuctions.detail.description")}
                </p>
            </header>
            <dl className="grid gap-x-6 gap-y-3 border bg-surface-container-low p-5 text-sm sm:grid-cols-2">
                <ReadOnlyFact
                    label={t("adminAuctions.fields.auctionId")}
                    value={auction.auctionId}
                />
                <ReadOnlyFact
                    label={t("adminAuctions.fields.listingSourceId")}
                    value={auction.listingSourceId}
                />
                <ReadOnlyFact
                    label={t("adminAuctions.fields.sourceAuctionId")}
                    value={auction.sourceAuctionId}
                />
                <ReadOnlyFact
                    label={t("adminAuctions.fields.created")}
                    value={`${formatDateTime(auction.created, i18n.language, "UTC")} UTC`}
                />
                <ReadOnlyFact
                    label={t("adminAuctions.fields.updated")}
                    value={`${formatDateTime(auction.updated, i18n.language, "UTC")} UTC`}
                />
            </dl>
            <form
                className="grid gap-6 border bg-card p-5 sm:p-7"
                onSubmit={form.handleSubmit(async (values) => {
                    try {
                        const updated = await updateAuction.mutateAsync({
                            values,
                            expectedVersion,
                        });
                        form.reset(mapAdminAuctionFormValues(updated, language));
                        setExpectedVersion(updated.expectedVersion);
                    } catch {
                        // The mutation exposes a localized, status-based error below.
                    }
                })}
            >
                <AuctionMetadataFields form={form} />
                <p className="text-sm text-muted-foreground">
                    {t("adminAuctions.detail.blankFieldsHelp")}
                </p>
                {staleError ? (
                    <div className="grid justify-items-start gap-3 border border-destructive/50 p-4">
                        <p role="alert" className="text-sm text-destructive">
                            {staleError.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t("adminAuctions.errors.staleVersionHelp")}
                        </p>
                        <Button type="button" variant="outline" onClick={() => void reloadLatest()}>
                            {t("adminAuctions.actions.loadLatest")}
                        </Button>
                    </div>
                ) : updateAuction.error ? (
                    <p role="alert" className="text-sm text-destructive">
                        {updateAuction.error instanceof Error
                            ? updateAuction.error.message
                            : t("adminAuctions.errors.requestFailed")}
                    </p>
                ) : null}
                <div className="flex flex-wrap justify-end gap-2">
                    <Button type="submit" disabled={updateAuction.isPending}>
                        {updateAuction.isPending
                            ? t("adminAuctions.actions.saving")
                            : t("adminAuctions.actions.save")}
                    </Button>
                </div>
            </form>
        </main>
    );
}

function BackToAuctions({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    return (
        <Link
            to="/$lng/admin/auctions"
            params={{ lng: language }}
            className="w-fit text-sm text-primary underline-offset-4 hover:underline"
        >
            {t("adminAuctions.actions.backToOverview")}
        </Link>
    );
}

function ReadOnlyFact({ label, value }: { readonly label: string; readonly value: string }) {
    return (
        <div className="grid min-w-0 gap-1">
            <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
            <dd className="break-all font-mono text-xs">{value}</dd>
        </div>
    );
}
