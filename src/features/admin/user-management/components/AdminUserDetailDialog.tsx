import { useIsMutating } from "@tanstack/react-query";
import { Check, CircleAlert, Copy } from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AdminUserAccount } from "@/data/internal/admin/AdminUser.ts";
import { AdminInlineConfirm } from "@/features/admin/common/components/AdminInlineConfirm.tsx";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    ADMIN_SECTION_TITLE_CLASS,
    ADMIN_SKELETON_CLASS,
    ADMIN_SMALL_DANGER_OUTLINE_CLASS,
    ADMIN_STRONG_TAG_CLASS,
    ADMIN_TAG_CLASS,
    FOCUS_CLASS,
    MONO_LABEL_CLASS,
    SMALL_SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { useRetainedDialogValue } from "@/hooks/common/useRetainedDialogValue.ts";
import { cn } from "@/lib/utils.ts";
import {
    ADMIN_USER_PATCH_MUTATION_KEY,
    useAdminUser,
    useDeleteAdminUser,
} from "../api/useAdminUsers.ts";
import { adminUserDisplayName } from "./AdminUserPicker.tsx";
import { AdminUserProfileForm } from "./AdminUserProfileForm.tsx";
import { AdminUserRoleForm } from "./AdminUserRoleForm.tsx";
import { AdminUserTierForm } from "./AdminUserTierForm.tsx";

/**
 * One account in a dialog (board "Admin · User account"): profile, role and tier, the security
 * controls and deletion, reached through section tabs that scroll to each part.
 */
export function AdminUserDetailDialog({
    userId,
    onOpenChange,
    renderSecurityActions,
}: {
    readonly userId?: string;
    readonly onOpenChange: (open: boolean) => void;
    /** Extension slot for the separately owned suspension/session/token controls. */
    readonly renderSecurityActions?: (userId: string) => ReactNode;
}) {
    const { t } = useTranslation();
    const open = Boolean(userId);
    const [displayedUserId, releaseUserId] = useRetainedDialogValue(userId, open);
    const user = useAdminUser(displayedUserId, open);
    const deleteAdminUser = useDeleteAdminUser();
    const account = user.data;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) deleteAdminUser.reset();
        onOpenChange(nextOpen);
    };

    const handleDelete = async (target: AdminUserAccount) => {
        try {
            await deleteAdminUser.mutateAsync(target.userId);
            toast.success(t("adminUsers.success.deleted"));
            onOpenChange(false);
        } catch {
            // The mutation exposes a localized, status-based error in the delete block.
        }
    };

    const name = account ? adminUserDisplayName(account) : undefined;

    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={handleOpenChange}
            onCloseAutoFocus={releaseUserId}
            width="lg"
            eyebrow={account ? t("adminUsers.detail.title") : undefined}
            title={name ?? t("adminUsers.detail.title")}
            subtitle={account && name !== account.email ? account.email : undefined}
        >
            {account && (
                <AdminUserDetails
                    key={account.userId}
                    account={account}
                    deletePending={deleteAdminUser.isPending}
                    deleteError={deleteAdminUser.error?.message}
                    securityActions={renderSecurityActions?.(account.userId)}
                    onAskDelete={() => deleteAdminUser.reset()}
                    onDelete={() => void handleDelete(account)}
                />
            )}
            {!account && user.isError && (
                <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3.5 rounded-md bg-surface px-5 py-[18px] shadow-ring"
                >
                    <span className="flex gap-2.5 text-sm leading-normal text-oxblood">
                        <CircleAlert
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0"
                            strokeWidth={2}
                        />
                        {user.error?.message}
                    </span>
                    <button
                        type="button"
                        onClick={() => void user.refetch()}
                        className={SMALL_SECONDARY_PILL_CLASS}
                    >
                        {t("adminCommon.retry")}
                    </button>
                </div>
            )}
            {!account && !user.isError && (
                <div aria-busy="true" className="flex flex-col gap-3.5">
                    <div aria-hidden="true" className="grid grid-cols-2 gap-2.5">
                        {[0, 1, 2, 3].map((index) => (
                            <span key={index} className={cn(ADMIN_SKELETON_CLASS, "h-10")} />
                        ))}
                    </div>
                    <output className="block text-meta text-ink-secondary">
                        {t("adminUsers.loadingDetail")}
                    </output>
                </div>
            )}
        </AdminRecordDialog>
    );
}

type SectionKey = "profile" | "access" | "security" | "delete";

function sectionKeys(withSecurity: boolean): SectionKey[] {
    return withSecurity
        ? ["profile", "access", "security", "delete"]
        : ["profile", "access", "delete"];
}

const TAB_LABEL_KEYS: Record<SectionKey, string> = {
    profile: "adminUsers.tabs.profile",
    access: "adminUsers.tabs.role",
    security: "adminUsers.tabs.security",
    delete: "adminUsers.tabs.delete",
};

function AdminUserDetails({
    account,
    deletePending,
    deleteError,
    securityActions,
    onAskDelete,
    onDelete,
}: {
    readonly account: AdminUserAccount;
    readonly deletePending: boolean;
    readonly deleteError?: string;
    readonly securityActions?: ReactNode;
    readonly onAskDelete: () => void;
    readonly onDelete: () => void;
}) {
    const { t } = useTranslation();
    const idPrefix = useId();
    const sectionId = (key: SectionKey) => `${idPrefix}-${key}`;
    const withSecurity = Boolean(securityActions);
    const sections = sectionKeys(withSecurity);
    const [active, setActive] = useState<SectionKey>("profile");
    const navRef = useRef<HTMLElement>(null);
    const patchPending = useIsMutating({ mutationKey: ADMIN_USER_PATCH_MUTATION_KEY }) > 0;

    // Mark the section in view while the dialog scrolls.
    useEffect(() => {
        const nav = navRef.current;
        const container = nav?.closest<HTMLElement>('[data-slot="dialog-content"]');
        if (!nav || !container) return;
        const keys = sectionKeys(withSecurity);
        const onScroll = () => {
            const navBottom = nav.getBoundingClientRect().bottom;
            let current: SectionKey = "profile";
            for (const key of keys) {
                const section = document.getElementById(`${idPrefix}-${key}`);
                if (section && section.getBoundingClientRect().top - navBottom <= 24) {
                    current = key;
                }
            }
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
                current = "delete";
            }
            setActive(current);
        };
        container.addEventListener("scroll", onScroll, { passive: true });
        return () => container.removeEventListener("scroll", onScroll);
    }, [idPrefix, withSecurity]);

    const goTo = (key: SectionKey) => (event: MouseEvent<HTMLAnchorElement>) => {
        // Scroll inside the dialog instead of changing the URL hash, which the router owns.
        event.preventDefault();
        const target = document.getElementById(sectionId(key));
        if (!target) return;
        const reduceMotion =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView?.({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        target.focus({ preventScroll: true });
        setActive(key);
    };

    const sectionClass = "flex scroll-mt-14 flex-col gap-5 border-b border-line py-7 outline-none";

    return (
        <div className="-mt-2 flex min-w-0 flex-col">
            <AccountMeta account={account} />

            <nav
                ref={navRef}
                aria-label={t("adminUsers.tabs.label")}
                className="sticky top-0 z-10 -mx-5 mt-4 flex gap-6 overflow-x-auto bg-surface-raised px-5 shadow-[inset_0_-1px_0_var(--line)] sm:-mx-7 sm:px-7"
            >
                {sections.map((key) => {
                    const current = key === active;
                    return (
                        <a
                            key={key}
                            href={`#${sectionId(key)}`}
                            aria-current={current ? "location" : undefined}
                            onClick={goTo(key)}
                            className={cn(
                                "inline-flex min-h-12 shrink-0 items-center text-sm whitespace-nowrap hover:text-ink",
                                current
                                    ? "font-medium text-ink shadow-[inset_0_-2px_0_var(--oxblood)]"
                                    : "text-ink-secondary",
                                FOCUS_CLASS,
                            )}
                        >
                            {t(TAB_LABEL_KEYS[key])}
                        </a>
                    );
                })}
            </nav>

            <section
                id={sectionId("profile")}
                tabIndex={-1}
                aria-labelledby={`${sectionId("profile")}-title`}
                className={sectionClass}
            >
                <h3 id={`${sectionId("profile")}-title`} className={ADMIN_SECTION_TITLE_CLASS}>
                    {t("adminUsers.tabs.profile")}
                </h3>
                <AdminUserProfileForm
                    key={JSON.stringify([
                        account.firstName,
                        account.lastName,
                        account.language,
                        account.currency,
                        account.measurementUnit,
                        account.showUnassessedOrSensitiveContent,
                    ])}
                    account={account}
                />
            </section>

            <section
                id={sectionId("access")}
                tabIndex={-1}
                aria-labelledby={`${sectionId("access")}-title`}
                className={sectionClass}
            >
                <h3 id={`${sectionId("access")}-title`} className={ADMIN_SECTION_TITLE_CLASS}>
                    {t("adminUsers.sections.access")}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminUserRoleForm key={account.role} account={account} />
                    <AdminUserTierForm key={account.tier} account={account} />
                </div>
            </section>

            {securityActions && (
                <section
                    id={sectionId("security")}
                    tabIndex={-1}
                    aria-labelledby={`${sectionId("security")}-title`}
                    className={cn(sectionClass, "gap-6")}
                >
                    <h3 id={`${sectionId("security")}-title`} className={ADMIN_SECTION_TITLE_CLASS}>
                        {t("adminUsers.tabs.security")}
                    </h3>
                    {securityActions}
                </section>
            )}

            <section
                id={sectionId("delete")}
                tabIndex={-1}
                aria-labelledby={`${sectionId("delete")}-title`}
                className="scroll-mt-14 pt-7 outline-none"
            >
                <DeleteBlock
                    titleId={`${sectionId("delete")}-title`}
                    pending={deletePending}
                    disabled={patchPending}
                    error={deleteError}
                    onAsk={onAskDelete}
                    onDelete={onDelete}
                />
            </section>
        </div>
    );
}

/** User ID with Copy, then the role and tier tags. */
function AccountMeta({ account }: { readonly account: AdminUserAccount }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(account.userId);
            setCopied(true);
        } catch {
            // No clipboard access (insecure context or refused); the ID stays selectable.
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex min-w-0 items-center gap-2">
                <span className={MONO_LABEL_CLASS}>{t("adminUsers.fields.userId")}</span>
                <code className="font-mono text-xs break-all text-ink-secondary">
                    {account.userId}
                </code>
                <button
                    type="button"
                    onClick={() => void copyId()}
                    aria-label={copied ? t("adminCommon.copied") : t("adminUsers.detail.copyId")}
                    className={cn(
                        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink",
                        FOCUS_CLASS,
                    )}
                >
                    {copied ? (
                        <Check aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    ) : (
                        <Copy aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    )}
                </button>
            </span>
            <span className={account.role === "ADMIN" ? ADMIN_STRONG_TAG_CLASS : ADMIN_TAG_CLASS}>
                {t(`adminUsers.options.roles.${account.role}`)}
            </span>
            <span className={ADMIN_TAG_CLASS}>
                {t(`adminUsers.options.tiers.${account.tier.toUpperCase()}`)}
            </span>
        </div>
    );
}

/** The oxblood-ringed delete block with its inline confirmation. */
function DeleteBlock({
    titleId,
    pending,
    disabled,
    error,
    onAsk,
    onDelete,
}: {
    readonly titleId: string;
    readonly pending: boolean;
    readonly disabled: boolean;
    readonly error?: string;
    readonly onAsk: () => void;
    readonly onDelete: () => void;
}) {
    const { t } = useTranslation();
    const [confirming, setConfirming] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [restoreFocus, setRestoreFocus] = useState(false);

    useEffect(() => {
        if (!restoreFocus) return;
        triggerRef.current?.focus();
        setRestoreFocus(false);
    }, [restoreFocus]);

    return (
        <div className="flex flex-col gap-3.5 rounded-md p-5 shadow-[inset_0_0_0_1px_var(--oxblood)]">
            <h3 id={titleId} className={cn(ADMIN_SECTION_TITLE_CLASS, "text-oxblood")}>
                {t("adminUsers.delete.title")}
            </h3>
            {confirming ? (
                <AdminInlineConfirm
                    message={t("adminUsers.delete.question")}
                    confirmLabel={t("adminUsers.actions.deleteForGood")}
                    pending={pending}
                    error={error}
                    onConfirm={onDelete}
                    onCancel={() => {
                        setConfirming(false);
                        setRestoreFocus(true);
                    }}
                    className="bg-transparent p-0 shadow-none"
                />
            ) : (
                <button
                    ref={triggerRef}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        onAsk();
                        setConfirming(true);
                    }}
                    className={cn(ADMIN_SMALL_DANGER_OUTLINE_CLASS, "self-start")}
                >
                    {t("adminUsers.actions.delete")}
                </button>
            )}
        </div>
    );
}
