import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { groupAdminCredentials } from "@/data/internal/admin/AdminAccessToken.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { clearViewerScopedQueries } from "@/features/authentication/lib/clearViewerScopedQueries.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
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
import { AdminConfirmation } from "./AdminConfirmation.tsx";
import { AdminUserCredentialList } from "./AdminUserCredentialList.tsx";

type ConfirmationKey = "sessions" | "revoke-all" | `revoke:${string}`;

type PendingAction =
    | "suspend"
    | "unsuspend"
    | "sessions"
    | "revoke-all"
    | `revoke:${string}`
    | null;

export function AdminUserSecurityControls({ userId }: { readonly userId: string }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { signOut } = useResolvedAuth();
    const { data: currentAccount } = useUserAccount();
    const isSelfTarget = currentAccount?.userId === userId;
    const navigate = useNavigate({ from: "/$lng" });
    const { lng } = useParams({ from: "/$lng" });
    const actions = useAdminUserSecurityActions();
    const tokenPages = useAdminUserAccessTokens(userId);
    const credentials = groupAdminCredentials(
        tokenPages.data?.pages.flatMap((page) => page.items) ?? [],
    );
    const credentialCount = credentials.personalTokens.length + credentials.connectedApps.length;
    const [pending, setPending] = useState<PendingAction>(null);
    const [requestError, setRequestError] = useState<string>();
    const [confirmedSuspension, setConfirmedSuspension] = useState<boolean | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationKey | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const [restoreFocusTo, setRestoreFocusTo] = useState<ConfirmationKey | null>(null);

    useEffect(() => {
        if (!restoreFocusTo) return;
        sectionRef.current
            ?.querySelector<HTMLElement>(
                `[data-confirmation-trigger="${CSS.escape(restoreFocusTo)}"]`,
            )
            ?.focus();
        setRestoreFocusTo(null);
    }, [restoreFocusTo]);

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

    const submitSuspension = async ({ reason }: ReasonValues) => {
        const normalizedReason = normalizeAdminSuspensionReason(reason);
        if (!normalizedReason) {
            reasonForm.setError("reason", {
                message: t("adminUsers.security.suspension.reasonRequired"),
            });
            return;
        }

        setRequestError(undefined);
        setPending("suspend");
        const request = actions.suspend({ userId, reason: normalizedReason });
        // The backend logs this reason. Keep it only in the request closure after submission.
        reasonForm.reset({ reason: "" });
        try {
            const result = await request;
            setConfirmedSuspension(result.suspended);
            toast.success(t("adminUsers.security.suspension.suspended"));
            if (isSelfTarget) {
                toast.info(t("adminUsers.security.suspension.selfSuspended"));
                await reauthenticateAfterSelfAction().catch(() => undefined);
            } else {
                await queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(userId) });
            }
        } catch (error) {
            setRequestError(
                error instanceof Error ? error.message : t("adminUsers.errors.requestFailed"),
            );
        } finally {
            setPending(null);
        }
    };

    const runUnsuspend = async () => {
        setRequestError(undefined);
        setPending("unsuspend");
        try {
            const result = await actions.unsuspend(userId);
            setConfirmedSuspension(result.suspended);
            toast.success(t("adminUsers.security.suspension.unsuspended"));
            await queryClient.invalidateQueries({ queryKey: adminUserDetailQueryKey(userId) });
        } catch (error) {
            setRequestError(
                error instanceof Error ? error.message : t("adminUsers.errors.requestFailed"),
            );
        } finally {
            setPending(null);
        }
    };

    const runSessionRevocation = async () => {
        setRequestError(undefined);
        setPending("sessions");
        setConfirmation(null);
        try {
            await actions.revokeSessions(userId);
            toast.success(t("adminUsers.security.sessions.revoked"));
            if (isSelfTarget) {
                toast.info(t("adminUsers.security.sessions.selfRevoked"));
                await reauthenticateAfterSelfAction().catch(() => undefined);
            }
        } catch (error) {
            setRequestError(
                error instanceof Error ? error.message : t("adminUsers.errors.requestFailed"),
            );
        } finally {
            setPending(null);
        }
    };

    const runTokenRevocation = async (accessTokenId: string) => {
        setRequestError(undefined);
        setPending(`revoke:${accessTokenId}`);
        setConfirmation(null);
        try {
            await actions.revokeToken({ userId, accessTokenId });
            toast.success(t("adminUsers.security.tokens.revoked"));
        } catch (error) {
            setRequestError(
                error instanceof Error ? error.message : t("adminUsers.errors.requestFailed"),
            );
        } finally {
            setPending(null);
        }
    };

    const runAllTokenRevocation = async () => {
        setRequestError(undefined);
        setPending("revoke-all");
        setConfirmation(null);
        try {
            await actions.revokeAllTokens(userId);
            toast.success(t("adminUsers.security.tokens.allRevoked"));
        } catch (error) {
            setRequestError(
                error instanceof Error ? error.message : t("adminUsers.errors.requestFailed"),
            );
        } finally {
            setPending(null);
        }
    };

    const actionsDisabled = pending !== null;

    return (
        <section
            ref={sectionRef}
            className="grid gap-6 border-y py-5"
            aria-label={t("adminUsers.security.title")}
        >
            <div className="grid gap-5">
                <div className="grid gap-2">
                    <h3 className="font-semibold">{t("adminUsers.security.suspension.title")}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t("adminUsers.security.suspension.description")}
                    </p>
                    {confirmedSuspension === null ? (
                        <p className="text-sm text-muted-foreground">
                            {t("adminUsers.security.suspension.stateUnknown")}
                        </p>
                    ) : (
                        <p className="text-sm" role="status">
                            {confirmedSuspension
                                ? t("adminUsers.security.suspension.confirmedSuspended")
                                : t("adminUsers.security.suspension.confirmedActive")}
                        </p>
                    )}
                </div>

                <form
                    noValidate
                    className="grid gap-3"
                    onSubmit={reasonForm.handleSubmit(submitSuspension)}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="admin-user-suspension-reason">
                            {t("adminUsers.security.suspension.reason")}
                        </Label>
                        <p
                            id="admin-user-suspension-reason-help"
                            className="text-sm text-muted-foreground"
                        >
                            {t("adminUsers.security.suspension.reasonHelp")}
                        </p>
                        <textarea
                            id="admin-user-suspension-reason"
                            className="min-h-24 w-full border bg-background px-3 py-2 text-sm"
                            aria-describedby="admin-user-suspension-reason-help"
                            aria-invalid={Boolean(reasonForm.formState.errors.reason)}
                            disabled={actionsDisabled}
                            {...reasonForm.register("reason")}
                        />
                        {reasonForm.formState.errors.reason?.message && (
                            <p className="text-sm text-destructive" role="alert">
                                {reasonForm.formState.errors.reason.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <Button type="submit" disabled={actionsDisabled}>
                            {pending === "suspend"
                                ? t("adminUsers.security.actions.suspending")
                                : t("adminUsers.security.actions.suspend")}
                        </Button>
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={actionsDisabled}
                        onClick={() => void runUnsuspend()}
                    >
                        {pending === "unsuspend"
                            ? t("adminUsers.security.actions.unsuspending")
                            : t("adminUsers.security.actions.unsuspend")}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t("adminUsers.security.suspension.unsuspendDescription")}
                    </span>
                </div>
            </div>

            <div className="grid gap-3 border-t pt-5">
                <div>
                    <h3 className="font-semibold">{t("adminUsers.security.sessions.title")}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("adminUsers.security.sessions.description")}
                    </p>
                </div>
                {confirmation === "sessions" ? (
                    <AdminConfirmation
                        prompt={t("adminUsers.security.sessions.confirm")}
                        confirmLabel={t("adminUsers.security.actions.confirmSessionRevocation")}
                        disabled={actionsDisabled}
                        onConfirm={() => void runSessionRevocation()}
                        onCancel={cancelConfirmation}
                    />
                ) : (
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={actionsDisabled}
                            data-confirmation-trigger="sessions"
                            onClick={() => setConfirmation("sessions")}
                        >
                            {t("adminUsers.security.actions.revokeSessions")}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-3 border-t pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="font-semibold">{t("adminUsers.security.tokens.title")}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("adminUsers.security.tokens.description")}
                        </p>
                    </div>
                    {confirmation === "revoke-all" ? (
                        <AdminConfirmation
                            prompt={t("adminUsers.security.tokens.confirmAll")}
                            confirmLabel={t(
                                "adminUsers.security.actions.confirmAllTokenRevocation",
                            )}
                            disabled={actionsDisabled}
                            onConfirm={() => void runAllTokenRevocation()}
                            onCancel={cancelConfirmation}
                        />
                    ) : (
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={actionsDisabled}
                            data-confirmation-trigger="revoke-all"
                            onClick={() => setConfirmation("revoke-all")}
                        >
                            {pending === "revoke-all"
                                ? t("adminUsers.security.actions.revoking")
                                : t("adminUsers.security.actions.revokeAllTokens")}
                        </Button>
                    )}
                </div>

                {tokenPages.isLoading && (
                    <div className="flex justify-center py-6" role="status" aria-live="polite">
                        <span className="sr-only">{t("adminUsers.security.tokens.loading")}</span>
                        <Spinner />
                    </div>
                )}
                {tokenPages.isError && (
                    <div className="grid gap-2" role="alert">
                        <p className="text-sm text-destructive">{tokenPages.error.message}</p>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void tokenPages.refetch()}
                            >
                                {t("adminUsers.actions.retry")}
                            </Button>
                        </div>
                    </div>
                )}
                {tokenPages.data && credentialCount === 0 && (
                    <p className="border p-4 text-sm text-muted-foreground">
                        {t("adminUsers.security.tokens.empty")}
                    </p>
                )}
                {credentialCount > 0 && (
                    <AdminUserCredentialList
                        credentials={credentials}
                        confirmation={confirmation}
                        pending={pending}
                        disabled={actionsDisabled}
                        onAsk={setConfirmation}
                        onCancel={cancelConfirmation}
                        onRevoke={(accessTokenId) => void runTokenRevocation(accessTokenId)}
                    />
                )}
                {tokenPages.hasNextPage && (
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={tokenPages.isFetchingNextPage || actionsDisabled}
                            onClick={() => void tokenPages.fetchNextPage()}
                        >
                            {tokenPages.isFetchingNextPage
                                ? t("adminUsers.security.tokens.loadingMore")
                                : t("adminUsers.security.tokens.loadMore")}
                        </Button>
                    </div>
                )}
            </div>

            {requestError && (
                <p className="text-sm text-destructive" role="alert">
                    {requestError}
                </p>
            )}
        </section>
    );
}
