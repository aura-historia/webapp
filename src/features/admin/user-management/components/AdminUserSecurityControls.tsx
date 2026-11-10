import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CircleAlert, Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { groupAdminCredentials } from "@/data/internal/admin/AdminAccessToken.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { AdminInlineConfirm } from "@/features/admin/common/components/AdminInlineConfirm.tsx";
import {
    AdminMark,
    type AdminMarkTone,
} from "@/features/admin/common/components/AdminStatusMark.tsx";
import {
    ADMIN_SKELETON_CLASS,
    ADMIN_SMALL_DANGER_OUTLINE_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    INLINE_ALERT_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import { useClientNow } from "@/features/partner/access-token-management/lib/accessTokenExpiry.ts";
import { cn } from "@/lib/utils.ts";
import { adminUserDetailQueryKey } from "../api/useAdminUsers.ts";
import {
    useAdminUserAccessTokens,
    useAdminUserSecurityActions,
} from "../api/useAdminUserSecurity.ts";
import {
    ADMIN_SUSPENSION_REASON_MAX_BYTES,
    normalizeAdminSuspensionReason,
    utf8ByteLength,
} from "../lib/adminUserSecurityValidation.ts";
import { AdminUserCredentialList } from "./AdminUserCredentialList.tsx";

type ConfirmationKey = "suspend" | "sessions" | "revoke-all" | `revoke:${string}`;

type PendingAction = "suspend" | "unsuspend" | "sessions" | "revoke-all" | `revoke:${string}`;

type Block = "suspension" | "sessions" | "tokens";

const BLOCK_CLASS = "flex flex-col gap-3 border-t border-line-subtle pt-5";
const BLOCK_TITLE_CLASS = "text-[15px] font-semibold";

/**
 * The security part of the account dialog (board "Admin · User account"): suspension with its
 * logged reason, sign-in sessions, and the user's tokens and connected apps. Every destructive
 * action confirms inline; reactivation does not ask. Acting on your own account signs you out.
 */
export function AdminUserSecurityControls({ userId }: { readonly userId: string }) {
    const { t, i18n } = useTranslation();
    const queryClient = useQueryClient();
    const { signOut } = useResolvedAuth();
    const { data: currentAccount } = useUserAccount();
    const isSelfTarget = currentAccount?.userId === userId;
    const navigate = useNavigate({ from: "/$lng" });
    const { lng } = useParams({ from: "/$lng" });
    const actions = useAdminUserSecurityActions();
    const tokenPages = useAdminUserAccessTokens(userId);
    const now = useClientNow(tokenPages.dataUpdatedAt);
    const credentials = groupAdminCredentials(
        tokenPages.data?.pages.flatMap((page) => page.items) ?? [],
    );
    const credentialCount = credentials.personalTokens.length + credentials.connectedApps.length;
    const [pending, setPending] = useState<PendingAction | null>(null);
    const [requestError, setRequestError] = useState<{ block: Block; message: string }>();
    const [confirmedSuspension, setConfirmedSuspension] = useState<boolean | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationKey | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const [restoreFocusTo, setRestoreFocusTo] = useState<ConfirmationKey | null>(null);
    const reasonId = useId();
    const number = new Intl.NumberFormat(i18n.language);

    useEffect(() => {
        if (!restoreFocusTo) return;
        rootRef.current
            ?.querySelector<HTMLElement>(
                `[data-confirmation-trigger="${CSS.escape(restoreFocusTo)}"]`,
            )
            ?.focus();
        setRestoreFocusTo(null);
    }, [restoreFocusTo]);

    const ask = (key: ConfirmationKey) => {
        setRequestError(undefined);
        setConfirmation(key);
    };

    const cancelConfirmation = () => {
        setRestoreFocusTo(confirmation);
        setConfirmation(null);
    };

    const reasonSchema = z.object({
        reason: z
            .string()
            .trim()
            .min(1, t("adminUsers.security.suspension.reasonRequired"))
            .refine(
                (reason) => utf8ByteLength(reason) <= ADMIN_SUSPENSION_REASON_MAX_BYTES,
                t("adminUsers.security.suspension.reasonTooLong"),
            ),
    });
    type ReasonValues = z.infer<typeof reasonSchema>;
    const reasonForm = useForm<ReasonValues>({
        resolver: zodResolver(reasonSchema),
        defaultValues: { reason: "" },
    });
    const reason = reasonForm.watch("reason");
    const reasonError = reasonForm.formState.errors.reason?.message;

    const reauthenticateAfterSelfAction = async () => {
        clearViewerScopedQueries(queryClient);
        try {
            await signOut();
        } finally {
            clearViewerScopedQueries(queryClient);
            await navigate({
                to: "/$lng/login",
                params: { lng },
                search: { mode: "sign-in" },
                replace: true,
            });
        }
    };

    /** Runs one action; the confirmation stays open while it is pending and closes afterwards. */
    const run = async (action: PendingAction, block: Block, work: () => Promise<void>) => {
        setRequestError(undefined);
        setPending(action);
        try {
            await work();
        } catch (error) {
            setRequestError({
                block,
                message:
                    error instanceof Error ? error.message : t("adminUsers.errors.requestFailed"),
            });
        } finally {
            setPending(null);
            setConfirmation(null);
        }
    };

    const askSuspension = () => {
        const normalizedReason = normalizeAdminSuspensionReason(reasonForm.getValues("reason"));
        if (!normalizedReason) {
            reasonForm.setError("reason", {
                message: t("adminUsers.security.suspension.reasonRequired"),
            });
            return;
        }
        ask("suspend");
    };

    const runSuspension = () => {
        const normalizedReason = normalizeAdminSuspensionReason(reasonForm.getValues("reason"));
        if (!normalizedReason) {
            setConfirmation(null);
            return;
        }
        void run("suspend", "suspension", async () => {
            const request = actions.suspend({ userId, reason: normalizedReason });
            // The backend logs this reason. Keep it only in the request closure after submission.
            reasonForm.reset({ reason: "" });
            const result = await request;
            setConfirmedSuspension(result.suspended);
            toast.success(t("adminUsers.security.suspension.suspended"));
            if (isSelfTarget) {
                toast.info(t("adminUsers.security.suspension.selfSuspended"));
                await reauthenticateAfterSelfAction().catch(() => undefined);
            } else {
                await queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(userId) });
            }
        });
    };

    const runUnsuspend = () =>
        run("unsuspend", "suspension", async () => {
            const result = await actions.unsuspend(userId);
            setConfirmedSuspension(result.suspended);
            toast.success(t("adminUsers.security.suspension.unsuspended"));
            await queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(userId) });
        });

    const runSessionRevocation = () =>
        run("sessions", "sessions", async () => {
            await actions.revokeSessions(userId);
            toast.success(t("adminUsers.security.sessions.revokedToast"));
            if (isSelfTarget) {
                toast.info(t("adminUsers.security.sessions.selfRevoked"));
                await reauthenticateAfterSelfAction().catch(() => undefined);
            }
        });

    const runTokenRevocation = (accessTokenId: string) =>
        run(`revoke:${accessTokenId}`, "tokens", async () => {
            await actions.revokeToken({ userId, accessTokenId });
            toast.success(t("adminUsers.security.tokens.revoked"));
        });

    const runAllTokenRevocation = () =>
        run("revoke-all", "tokens", async () => {
            await actions.revokeAllTokens(userId);
            toast.success(t("adminUsers.security.tokens.allRevoked"));
        });

    const busy = pending !== null;
    const blockError = (block: Block) =>
        requestError?.block === block ? (
            <p role="alert" className={INLINE_ALERT_CLASS}>
                {requestError.message}
            </p>
        ) : null;

    let suspensionTone: AdminMarkTone = "dashed";
    let suspensionLabel = t("adminUsers.security.suspension.status.unknown");
    if (confirmedSuspension !== null) {
        suspensionTone = confirmedSuspension ? "oxblood" : "ink";
        suspensionLabel = confirmedSuspension
            ? t("adminUsers.security.suspension.status.suspended")
            : t("adminUsers.security.suspension.status.active");
    }

    return (
        <div ref={rootRef} className="flex flex-col gap-6">
            {/* Suspension */}
            <div className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h4 className={BLOCK_TITLE_CLASS}>
                        {t("adminUsers.security.suspension.heading")}
                    </h4>
                    <output className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-ink-secondary uppercase">
                        <AdminMark tone={suspensionTone} />
                        {suspensionLabel}
                    </output>
                </div>
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor={reasonId}
                        className={FIELD_LABEL_CLASS}
                        data-error={reasonError ? "true" : undefined}
                    >
                        {t("adminUsers.security.suspension.reason")}
                    </label>
                    <textarea
                        id={reasonId}
                        rows={3}
                        aria-invalid={reasonError ? true : undefined}
                        aria-describedby={[`${reasonId}-hint`, reasonError && `${reasonId}-error`]
                            .filter(Boolean)
                            .join(" ")}
                        readOnly={confirmation === "suspend"}
                        disabled={busy}
                        className={cn(
                            FIELD_CLASS,
                            "h-auto min-h-24 resize-y py-2.5 leading-normal",
                        )}
                        {...reasonForm.register("reason")}
                    />
                    <span
                        id={`${reasonId}-hint`}
                        className="flex justify-between gap-3 text-xs leading-[1.45] text-ink-muted"
                    >
                        <span>{t("adminUsers.security.suspension.reasonHint")}</span>
                        <span className="shrink-0 tabular-nums">
                            {t("adminUsers.security.suspension.reasonBytes", {
                                used: number.format(utf8ByteLength(reason)),
                                max: number.format(ADMIN_SUSPENSION_REASON_MAX_BYTES),
                            })}
                        </span>
                    </span>
                    {reasonError && (
                        <p id={`${reasonId}-error`} role="alert" className={FIELD_ERROR_CLASS}>
                            {reasonError}
                        </p>
                    )}
                </div>
                {confirmation === "suspend" ? (
                    <AdminInlineConfirm
                        message={t("adminUsers.security.suspension.confirmQuestion")}
                        confirmLabel={t("adminUsers.security.actions.suspend")}
                        pending={pending === "suspend"}
                        onConfirm={runSuspension}
                        onCancel={cancelConfirmation}
                    />
                ) : (
                    <div className="flex flex-wrap gap-2.5">
                        <button
                            type="button"
                            disabled={busy}
                            data-confirmation-trigger="suspend"
                            onClick={() => void reasonForm.handleSubmit(askSuspension)()}
                            className={ADMIN_SMALL_DANGER_OUTLINE_CLASS}
                        >
                            {t("adminUsers.security.actions.suspend")}
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            aria-busy={pending === "unsuspend"}
                            onClick={() => void runUnsuspend()}
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {pending === "unsuspend" && <Spinner />}
                            {pending === "unsuspend"
                                ? t("adminUsers.security.actions.unsuspending")
                                : t("adminUsers.security.actions.unsuspend")}
                        </button>
                    </div>
                )}
                {blockError("suspension")}
            </div>

            {/* Sign-in sessions */}
            <div className={BLOCK_CLASS}>
                <BlockHeader title={t("adminUsers.security.sessions.heading")}>
                    {confirmation !== "sessions" && (
                        <button
                            type="button"
                            disabled={busy}
                            data-confirmation-trigger="sessions"
                            onClick={() => ask("sessions")}
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {t("adminUsers.security.actions.confirmSessionRevocation")}
                        </button>
                    )}
                </BlockHeader>
                {confirmation === "sessions" && (
                    <AdminInlineConfirm
                        message={t("adminUsers.security.sessions.confirmQuestion")}
                        confirmLabel={t("adminUsers.security.actions.confirmSessionRevocation")}
                        pending={pending === "sessions"}
                        onConfirm={() => void runSessionRevocation()}
                        onCancel={cancelConfirmation}
                    />
                )}
                {blockError("sessions")}
            </div>

            {/* Tokens and connected apps */}
            <div className={cn(BLOCK_CLASS, "gap-4")}>
                <BlockHeader title={t("adminUsers.security.tokens.heading")}>
                    {confirmation !== "revoke-all" && (
                        <button
                            type="button"
                            disabled={busy}
                            data-confirmation-trigger="revoke-all"
                            onClick={() => ask("revoke-all")}
                            className={ADMIN_SMALL_DANGER_OUTLINE_CLASS}
                        >
                            {t("adminUsers.security.actions.revokeAllTokens")}
                        </button>
                    )}
                </BlockHeader>
                {confirmation === "revoke-all" && (
                    <AdminInlineConfirm
                        message={t("adminUsers.security.tokens.confirmAllQuestion")}
                        confirmLabel={t("adminUsers.security.actions.confirmAllTokenRevocation")}
                        pending={pending === "revoke-all"}
                        onConfirm={() => void runAllTokenRevocation()}
                        onCancel={cancelConfirmation}
                    />
                )}
                {blockError("tokens")}

                {tokenPages.isLoading && (
                    <div aria-busy="true" className="flex flex-col gap-2.5">
                        <output className="sr-only">
                            {t("adminUsers.security.tokens.loading")}
                        </output>
                        <span aria-hidden="true" className={cn(ADMIN_SKELETON_CLASS, "h-16")} />
                        <span aria-hidden="true" className={cn(ADMIN_SKELETON_CLASS, "h-16")} />
                    </div>
                )}
                {tokenPages.isError && credentialCount === 0 && (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-3.5 rounded-md bg-surface px-4 py-3.5 shadow-ring"
                    >
                        <span className="flex gap-2.5 text-sm leading-normal text-oxblood">
                            <CircleAlert
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0"
                                strokeWidth={2}
                            />
                            {tokenPages.error.message}
                        </span>
                        <button
                            type="button"
                            onClick={() => void tokenPages.refetch()}
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {t("adminCommon.retry")}
                        </button>
                    </div>
                )}
                {tokenPages.data && credentialCount === 0 && (
                    <p className="text-sm text-ink-secondary">
                        {t("adminUsers.security.tokens.none")}
                    </p>
                )}
                {credentialCount > 0 && (
                    <AdminUserCredentialList
                        credentials={credentials}
                        confirmation={confirmation}
                        pending={pending}
                        disabled={busy}
                        now={now}
                        onAsk={ask}
                        onCancel={cancelConfirmation}
                        onRevoke={(accessTokenId) => void runTokenRevocation(accessTokenId)}
                    />
                )}
                {(tokenPages.hasNextPage || tokenPages.isFetchingNextPage) && (
                    <div className="flex flex-col items-center gap-2.5">
                        {tokenPages.isFetchNextPageError && (
                            <p role="alert" className="text-meta text-oxblood">
                                {t("adminCommon.loadMoreFailed")}
                            </p>
                        )}
                        <button
                            type="button"
                            disabled={tokenPages.isFetchingNextPage || busy}
                            aria-busy={tokenPages.isFetchingNextPage}
                            onClick={() => void tokenPages.fetchNextPage()}
                            className={SMALL_SECONDARY_PILL_CLASS}
                        >
                            {tokenPages.isFetchingNextPage && <Spinner />}
                            {tokenPages.isFetchingNextPage
                                ? t("adminCommon.loading")
                                : t("adminUsers.security.tokens.loadMore")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function BlockHeader({
    title,
    children,
}: {
    readonly title: string;
    readonly children?: ReactNode;
}) {
    return (
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
            <h4 className={BLOCK_TITLE_CLASS}>{title}</h4>
            {children}
        </div>
    );
}

function Spinner() {
    return (
        <Loader2
            aria-hidden="true"
            className="size-[15px] animate-spin motion-reduce:animate-none"
        />
    );
}
