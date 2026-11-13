import { Link } from "@tanstack/react-router";
import { CircleAlert, Lock, MapPin, Plus, TriangleAlert } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import type { UserAddress } from "@/data/internal/geography/UserAddress.ts";
import { AddressEditorDialog } from "@/features/account-management/components/addresses/AddressEditorDialog.tsx";
import { DeleteAddressDialog } from "@/features/account-management/components/addresses/DeleteAddressDialog.tsx";
import { SavedAddressRow } from "@/features/account-management/components/addresses/SavedAddressRow.tsx";
import {
    UserAddressRequestError,
    useUserAddressList,
} from "@/features/account-management/hooks/useUserAddresses.ts";
import { CARD_CLASS, GROUP_LABEL_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import {
    ADDRESS_PRIMARY_BUTTON_CLASS,
    ADDRESS_ROW_BUTTON_CLASS,
} from "@/features/account-management/lib/addressStyles.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

type DialogState =
    | { readonly kind: "create" }
    | { readonly kind: "edit"; readonly address: UserAddress }
    | { readonly kind: "delete"; readonly address: UserAddress };

/** The account page's saved addresses card (board "Account · Saved addresses section"). */
export function SavedAddressesSection() {
    const { user } = useResolvedAuth();
    // A different viewer never sees another viewer's list, draft or dialog.
    return user ? (
        <SavedAddressesCard key={user.userId} viewerCacheKey={user.userId} />
    ) : (
        <CardSkeleton />
    );
}

function SavedAddressesCard({ viewerCacheKey }: { readonly viewerCacheKey: string }) {
    const { t } = useTranslation();
    const list = useUserAddressList(viewerCacheKey);
    const [dialog, setDialog] = useState<DialogState>();
    const addresses = list.data?.pages.flatMap((page) => page.items) ?? [];
    const accessLost = list.error instanceof UserAddressRequestError && list.error.isAccessLoss;

    // After a delete conflict the refreshed list carries the current version.
    const current = (address: UserAddress) =>
        addresses.find((item) => item.addressId === address.addressId) ?? address;

    let body: ReactNode;
    if (list.isPending) body = <RowsSkeleton />;
    else if (accessLost) body = <AccessLostPanel />;
    else if (list.isError && addresses.length === 0) {
        body = <ListErrorPanel onRetry={() => void list.refetch()} />;
    } else if (addresses.length === 0) body = <EmptyPanel />;
    else {
        body = (
            <>
                <ul aria-labelledby="saved-addresses-list-label" className="flex flex-col">
                    {addresses.map((address) => (
                        <SavedAddressRow
                            key={address.addressId}
                            address={address}
                            onEdit={() => setDialog({ kind: "edit", address })}
                            onDelete={() => setDialog({ kind: "delete", address })}
                        />
                    ))}
                </ul>
                {list.isFetchNextPageError ? (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-5"
                    >
                        <span className="inline-flex items-center gap-2 text-sm text-oxblood">
                            <CircleAlert
                                aria-hidden="true"
                                className="size-[15px]"
                                strokeWidth={2}
                            />
                            {t("account.addresses.loadMoreError")}
                        </span>
                        <button
                            type="button"
                            onClick={() => void list.fetchNextPage()}
                            className={ADDRESS_ROW_BUTTON_CLASS}
                        >
                            {t("account.addresses.retry")}
                        </button>
                    </div>
                ) : (
                    list.hasNextPage && (
                        <div className="flex justify-center border-t border-line-subtle pt-5">
                            <button
                                type="button"
                                disabled={list.isFetchingNextPage}
                                onClick={() => void list.fetchNextPage()}
                                className={cn(
                                    ADDRESS_ROW_BUTTON_CLASS,
                                    "w-full px-[22px] sm:w-auto",
                                )}
                            >
                                {list.isFetchingNextPage && <Spinner className="size-[15px]" />}
                                {t("account.addresses.showMore")}
                            </button>
                        </div>
                    )
                )}
            </>
        );
    }

    return (
        <div className={cn(CARD_CLASS, "flex flex-col gap-5")}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span id="saved-addresses-list-label" className={GROUP_LABEL_CLASS}>
                    {t("account.addresses.listLabel")}
                </span>
                {!accessLost && (
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => setDialog({ kind: "create" })}
                        className={cn(ADDRESS_PRIMARY_BUTTON_CLASS, "w-full sm:w-auto")}
                    >
                        <Plus aria-hidden="true" className="size-[15px]" strokeWidth={2} />
                        {t("account.addresses.add")}
                    </button>
                )}
            </div>
            {body}

            {dialog?.kind === "create" && (
                <AddressEditorDialog
                    viewerCacheKey={viewerCacheKey}
                    onClose={() => setDialog(undefined)}
                    onDelete={() => undefined}
                />
            )}
            {dialog?.kind === "edit" && (
                <AddressEditorDialog
                    viewerCacheKey={viewerCacheKey}
                    address={dialog.address}
                    onClose={() => setDialog(undefined)}
                    onDelete={(address) => setDialog({ kind: "delete", address })}
                />
            )}
            {dialog?.kind === "delete" && (
                <DeleteAddressDialog
                    viewerCacheKey={viewerCacheKey}
                    address={current(dialog.address)}
                    onClose={() => setDialog(undefined)}
                />
            )}
        </div>
    );
}

function StatePanel({
    icon,
    tone = "neutral",
    title,
    description,
    role,
    children,
}: {
    readonly icon: ReactNode;
    readonly tone?: "neutral" | "danger";
    readonly title: ReactNode;
    readonly description: string;
    readonly role?: "alert";
    readonly children?: ReactNode;
}) {
    return (
        <div
            role={role}
            className="flex flex-col items-center gap-3 border-t border-line-subtle px-3 pt-9 pb-7 text-center"
        >
            <span
                aria-hidden="true"
                className={cn(
                    "inline-flex size-14 items-center justify-center rounded-pill",
                    tone === "danger"
                        ? "bg-oxblood text-on-oxblood"
                        : "bg-surface text-ink shadow-ring",
                )}
            >
                {icon}
            </span>
            <p className="font-serif text-[26px] leading-[1.15] [&_em]:italic">{title}</p>
            <p className="max-w-[420px] text-body-sm text-ink-secondary">{description}</p>
            {children}
        </div>
    );
}

function EmptyPanel() {
    const { t } = useTranslation();
    return (
        <StatePanel
            icon={<MapPin className="size-[22px]" strokeWidth={1.6} />}
            title={
                <Trans i18nKey="account.addresses.empty.title" components={HEADLINE_COMPONENTS} />
            }
            description={t("account.addresses.empty.description")}
        />
    );
}

function ListErrorPanel({ onRetry }: { readonly onRetry: () => void }) {
    const { t } = useTranslation();
    return (
        <StatePanel
            role="alert"
            tone="danger"
            icon={<TriangleAlert className="size-[22px]" strokeWidth={1.8} />}
            title={
                <Trans i18nKey="account.addresses.error.title" components={HEADLINE_COMPONENTS} />
            }
            description={t("account.addresses.error.description")}
        >
            <button
                type="button"
                onClick={onRetry}
                className={cn(ADDRESS_ROW_BUTTON_CLASS, "mt-1 px-[22px]")}
            >
                {t("account.addresses.retry")}
            </button>
        </StatePanel>
    );
}

function AccessLostPanel() {
    const { t } = useTranslation();
    return (
        <StatePanel
            role="alert"
            icon={<Lock className="size-[22px]" strokeWidth={1.6} />}
            title={
                <Trans
                    i18nKey="account.addresses.accessLost.title"
                    components={HEADLINE_COMPONENTS}
                />
            }
            description={t("account.addresses.accessLost.description")}
        >
            <Link
                to="/$lng/login"
                search={{ mode: "sign-in" }}
                params={true}
                from="/$lng"
                className={cn(ADDRESS_PRIMARY_BUTTON_CLASS, "mt-1 px-[22px]")}
            >
                {t("account.addresses.accessLost.action")}
            </Link>
        </StatePanel>
    );
}

const SKELETON_BAR = "rounded-xs bg-surface-sunken";

function RowsSkeleton() {
    const { t } = useTranslation();
    return (
        <div aria-busy="true" className="flex animate-pulse flex-col motion-reduce:animate-none">
            <span className="sr-only">{t("account.addresses.loading")}</span>
            {[0, 1, 2].map((row) => (
                <div
                    key={row}
                    aria-hidden="true"
                    className="flex flex-col gap-3 border-t border-line-subtle py-6"
                >
                    <div className={cn(SKELETON_BAR, "h-[18px] w-[140px]")} />
                    <div className={cn(SKELETON_BAR, "h-3 w-[70%]")} />
                    <div className={cn(SKELETON_BAR, "h-3 w-[46%]")} />
                </div>
            ))}
        </div>
    );
}

function CardSkeleton() {
    const { t } = useTranslation();
    return (
        <div className={cn(CARD_CLASS, "flex flex-col gap-5")}>
            <span className={GROUP_LABEL_CLASS}>{t("account.addresses.listLabel")}</span>
            <RowsSkeleton />
        </div>
    );
}
