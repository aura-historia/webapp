import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { CURRENCIES, type Currency } from "@/data/internal/common/Currency.ts";
import { LANGUAGES, type Language } from "@/data/internal/common/Language.ts";
import { USER_ROLES, type UserRole } from "@/data/internal/account/UserRole.ts";
import { USER_TIERS, type AdminUser, type UserTier } from "@/data/internal/admin/AdminUser.ts";
import {
    useAdminUser,
    useDeleteAdminUser,
    usePatchAdminUser,
} from "@/hooks/admin/useAdminUsers.ts";
import { formatShortDate } from "@/lib/utils.ts";
import { toast } from "sonner";

interface AdminUserDetailDialogProps {
    readonly userId?: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

interface AdminUserEditFormProps {
    readonly user: AdminUser;
    readonly onClose: () => void;
}

function nullableText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

function AdminUserEditForm({ user, onClose }: AdminUserEditFormProps) {
    const { t, i18n } = useTranslation();
    const patch = usePatchAdminUser();
    const deleteUser = useDeleteAdminUser();
    const [firstName, setFirstName] = useState(user.firstName ?? "");
    const [lastName, setLastName] = useState(user.lastName ?? "");
    const [language, setLanguage] = useState<Language | "NONE">(user.language ?? "NONE");
    const [currency, setCurrency] = useState<Currency | "NONE">(user.currency ?? "NONE");
    const [tier, setTier] = useState<UserTier>(user.tier);
    const [role, setRole] = useState<UserRole>(user.role);
    const [stripeCustomerId, setStripeCustomerId] = useState(user.stripeCustomerId ?? "");
    const [prohibitedContentConsent, setProhibitedContentConsent] = useState(
        user.prohibitedContentConsent,
    );

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    const handleSave = () => {
        patch.mutate(
            {
                userId: user.userId,
                firstName: nullableText(firstName),
                lastName: nullableText(lastName),
                language: language === "NONE" ? null : language,
                currency: currency === "NONE" ? null : currency,
                prohibitedContentConsent,
                tier,
                role,
                stripeCustomerId: nullableText(stripeCustomerId),
            },
            {
                onSuccess: () => {
                    toast.success(t("adminDashboard.users.detail.updateSuccess"));
                },
            },
        );
    };

    const handleDelete = () => {
        if (
            !window.confirm(t("adminDashboard.users.detail.deleteConfirm", { email: user.email }))
        ) {
            return;
        }

        deleteUser.mutate(user.userId, {
            onSuccess: () => {
                toast.success(t("adminDashboard.users.detail.deleteSuccess"));
                onClose();
            },
        });
    };

    return (
        <>
            <div className="grid gap-4">
                <div className="rounded-md border bg-surface-container-low p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{displayName || user.email}</p>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                            {user.role}
                        </Badge>
                        <Badge variant="outline">{user.tier}</Badge>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <span>{user.email}</span>
                        <span className="font-mono" title={user.userId}>
                            {user.userId}
                        </span>
                        <span>
                            {t("adminDashboard.users.detail.createdAt", {
                                date: formatShortDate(user.created, i18n.language),
                            })}
                        </span>
                        <span>
                            {t("adminDashboard.users.detail.updatedAt", {
                                date: formatShortDate(user.updated, i18n.language),
                            })}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-user-first-name">
                            {t("adminDashboard.users.fields.firstName")}
                        </Label>
                        <Input
                            id="admin-user-first-name"
                            value={firstName}
                            maxLength={64}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-user-last-name">
                            {t("adminDashboard.users.fields.lastName")}
                        </Label>
                        <Input
                            id="admin-user-last-name"
                            value={lastName}
                            maxLength={64}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-user-language">
                            {t("adminDashboard.users.fields.language")}
                        </Label>
                        <Select
                            value={language}
                            onValueChange={(value) => setLanguage(value as Language | "NONE")}
                        >
                            <SelectTrigger id="admin-user-language">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">
                                    {t("adminDashboard.users.fields.notSet")}
                                </SelectItem>
                                {LANGUAGES.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {value.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-user-currency">
                            {t("adminDashboard.users.fields.currency")}
                        </Label>
                        <Select
                            value={currency}
                            onValueChange={(value) => setCurrency(value as Currency | "NONE")}
                        >
                            <SelectTrigger id="admin-user-currency">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">
                                    {t("adminDashboard.users.fields.notSet")}
                                </SelectItem>
                                {CURRENCIES.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-user-tier">
                            {t("adminDashboard.users.fields.tier")}
                        </Label>
                        <Select value={tier} onValueChange={(value) => setTier(value as UserTier)}>
                            <SelectTrigger id="admin-user-tier">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {USER_TIERS.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-user-role">
                            {t("adminDashboard.users.fields.role")}
                        </Label>
                        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                            <SelectTrigger id="admin-user-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {USER_ROLES.map((value) => (
                                    <SelectItem key={value} value={value}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="admin-user-stripe">
                        {t("adminDashboard.users.fields.stripeCustomerId")}
                    </Label>
                    <Input
                        id="admin-user-stripe"
                        value={stripeCustomerId}
                        onChange={(e) => setStripeCustomerId(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                    <div>
                        <Label htmlFor="admin-user-prohibited-content">
                            {t("adminDashboard.users.fields.prohibitedContentConsent")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            {t("adminDashboard.users.fields.prohibitedContentConsentHint")}
                        </p>
                    </div>
                    <Switch
                        id="admin-user-prohibited-content"
                        checked={prohibitedContentConsent}
                        onCheckedChange={setProhibitedContentConsent}
                    />
                </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteUser.isPending || patch.isPending}
                >
                    {deleteUser.isPending ? (
                        <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    {t("adminDashboard.users.detail.delete")}
                </Button>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteUser.isPending || patch.isPending}
                    >
                        {t("adminDashboard.actions.cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={deleteUser.isPending || patch.isPending}
                    >
                        {patch.isPending && <Spinner className="mr-2 h-4 w-4" />}
                        {t("adminDashboard.actions.save")}
                    </Button>
                </div>
            </DialogFooter>
        </>
    );
}

export function AdminUserDetailDialog({ userId, open, onOpenChange }: AdminUserDetailDialogProps) {
    const { t } = useTranslation();
    const { data: user, isPending, isError, refetch } = useAdminUser(userId, open);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.users.detail.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.users.detail.description")}
                    </DialogDescription>
                </DialogHeader>

                {isPending ? (
                    <div className="flex justify-center py-10" role="status" aria-live="polite">
                        <Spinner />
                    </div>
                ) : isError || !user ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            {t("adminDashboard.users.detail.loadError")}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => refetch()}>
                            {t("adminDashboard.actions.retry")}
                        </Button>
                    </div>
                ) : (
                    <AdminUserEditForm
                        key={`${user.userId}-${user.updated.toISOString()}`}
                        user={user}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
