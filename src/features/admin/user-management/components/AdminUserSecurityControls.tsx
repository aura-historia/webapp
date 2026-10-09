import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { ACCESS_TOKEN_SCOPE_METADATA } from "@/data/internal/access-tokens/AccessTokenScope.ts";
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
    const tokens = tokenPages.data?.pages.flatMap((page) => page.items) ?? [];
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
                    <Confirmation
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
                        <Confirmation
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
                {tokenPages.data && tokens.length === 0 && (
                    <p className="border p-4 text-sm text-muted-foreground">
                        {t("adminUsers.security.tokens.empty")}
                    </p>
                )}
                {tokens.length > 0 && (
                    <ul className="grid gap-3">
                        {tokens.map((token) => (
                            <li
                                key={token.accessTokenId}
                                className="grid gap-3 border p-4 sm:flex sm:items-start sm:justify-between"
                            >
                                <div className="grid min-w-0 gap-2">
                                    <h4 className="font-medium break-words">{token.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t("adminUsers.security.tokens.origin", {
                                            origin: token.origin,
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {token.expires
                                            ? t("adminUsers.security.tokens.expires", {
                                                  expires: token.expires,
                                              })
                                            : t("partnerAccessTokens.noExpiration")}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {token.scopes.length > 0 ? (
                                            token.scopes.map((scope) => (
                                                <span
                                                    key={scope}
                                                    className="border px-2 py-1 text-xs"
                                                >
                                                    {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="border px-2 py-1 text-xs">
                                                {t("partnerAccessTokens.noScopes")}
                                            </span>
                                        )}
                                    </div>
                                    <code className="break-all text-xs text-muted-foreground">
                                        {token.accessTokenId}
                                    </code>
                                    {confirmation === `revoke:${token.accessTokenId}` && (
                                        <Confirmation
                                            prompt={t("adminUsers.security.tokens.confirmSingle", {
                                                name: token.name,
                                            })}
                                            confirmLabel={t(
                                                "adminUsers.security.actions.confirmTokenRevocation",
                                            )}
                                            disabled={actionsDisabled}
                                            onConfirm={() =>
                                                void runTokenRevocation(token.accessTokenId)
                                            }
                                            onCancel={cancelConfirmation}
                                        />
                                    )}
                                </div>
                                {confirmation !== `revoke:${token.accessTokenId}` && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={actionsDisabled}
                                        data-confirmation-trigger={`revoke:${token.accessTokenId}`}
                                        onClick={() =>
                                            setConfirmation(`revoke:${token.accessTokenId}`)
                                        }
                                    >
                                        {pending === `revoke:${token.accessTokenId}`
                                            ? t("adminUsers.security.actions.revoking")
                                            : t("adminUsers.security.actions.revokeToken")}
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
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

function Confirmation({
    prompt,
    confirmLabel,
    disabled,
    onConfirm,
    onCancel,
}: {
    readonly prompt: string;
    readonly confirmLabel: string;
    readonly disabled: boolean;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}) {
    const { t } = useTranslation();
    const promptId = useId();
    const groupRef = useRef<HTMLDivElement>(null);

    // The trigger unmounts when the confirmation opens, so move focus here and announce the prompt.
    useEffect(() => {
        groupRef.current?.focus();
    }, []);

    return (
        <div
            ref={groupRef}
            role="group"
            aria-labelledby={promptId}
            tabIndex={-1}
            className="grid gap-2 outline-none sm:col-span-2"
        >
            <p id={promptId} className="text-sm">
                {prompt}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="destructive" disabled={disabled} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
                <Button type="button" variant="outline" disabled={disabled} onClick={onCancel}>
                    {t("adminUsers.actions.cancel")}
                </Button>
            </div>
        </div>
    );
}
