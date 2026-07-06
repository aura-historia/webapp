import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
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
import { Spinner } from "@/components/ui/spinner.tsx";
import { useUpdateAccessToken } from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import { AccessTokenScopesField } from "@/features/partner/access-token-management/components/AccessTokenCreateDialog.tsx";
import {
    type AccessTokenCreateFormData,
    createAccessTokenFormSchema,
} from "@/features/partner/access-token-management/components/AccessTokenCreateForm.ts";
import type { AccessToken } from "@/features/partner/access-token-management/types/AccessToken.ts";

interface AccessTokenEditDialogProps {
    readonly accessToken: AccessToken | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

function toLocalDateTimeInputValue(date: Date | null): string {
    if (!date) {
        return "";
    }

    const offsetInMilliseconds = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetInMilliseconds).toISOString().slice(0, 16);
}

export function AccessTokenEditDialog({
    accessToken,
    open,
    onOpenChange,
}: AccessTokenEditDialogProps) {
    if (!accessToken) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {open && (
                <AccessTokenEditDialogContent
                    key={accessToken.id}
                    accessToken={accessToken}
                    onClose={() => onOpenChange(false)}
                />
            )}
        </Dialog>
    );
}

function AccessTokenEditDialogContent({
    accessToken,
    onClose,
}: {
    readonly accessToken: AccessToken;
    readonly onClose: () => void;
}) {
    const { t } = useTranslation();
    const updateAccessToken = useUpdateAccessToken();
    const form = useForm<AccessTokenCreateFormData>({
        resolver: zodResolver(createAccessTokenFormSchema(t)),
        defaultValues: {
            name: accessToken.name,
            scopes: [...accessToken.scopes],
            expiresAt: toLocalDateTimeInputValue(accessToken.expiresAt),
        },
    });
    const scopesField = useController({ control: form.control, name: "scopes" }).field;

    const handleSubmit = (values: AccessTokenCreateFormData) => {
        updateAccessToken.mutate(
            {
                id: accessToken.id,
                name: values.name.trim(),
                scopes: values.scopes,
                expiresAt: values.expiresAt ? new Date(values.expiresAt) : undefined,
            },
            {
                onSuccess: () => {
                    toast.success(t("partnerAccessTokens.edit.success"));
                    onClose();
                },
            },
        );
    };

    return (
        <DialogContent className="sm:max-w-xl" showCloseButton={!updateAccessToken.isPending}>
            <DialogHeader>
                <DialogTitle>{t("partnerAccessTokens.edit.title")}</DialogTitle>
                <DialogDescription>
                    {t("partnerAccessTokens.edit.description", { name: accessToken.name })}
                </DialogDescription>
            </DialogHeader>

            <form
                noValidate
                className="flex flex-col gap-5"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <div className="grid gap-2">
                    <Label htmlFor="access-token-edit-name">
                        {t("partnerAccessTokens.create.fields.name")}
                    </Label>
                    <Input
                        id="access-token-edit-name"
                        autoComplete="off"
                        maxLength={128}
                        aria-invalid={Boolean(form.formState.errors.name)}
                        {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                <AccessTokenScopesField value={scopesField.value} onChange={scopesField.onChange} />

                <div className="grid gap-2">
                    <Label htmlFor="access-token-edit-expiration">
                        {t("partnerAccessTokens.create.fields.expiration")}
                    </Label>
                    <Input
                        id="access-token-edit-expiration"
                        type="datetime-local"
                        aria-invalid={Boolean(form.formState.errors.expiresAt)}
                        {...form.register("expiresAt")}
                    />
                    <p className="text-sm text-muted-foreground">
                        {t("partnerAccessTokens.create.fields.expirationHint")}
                    </p>
                    {form.formState.errors.expiresAt && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.expiresAt.message}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={updateAccessToken.isPending}
                        onClick={onClose}
                    >
                        {t("partnerAccessTokens.edit.cancel")}
                    </Button>
                    <Button type="submit" disabled={updateAccessToken.isPending}>
                        {updateAccessToken.isPending && <Spinner />}
                        {updateAccessToken.isPending
                            ? t("partnerAccessTokens.edit.submitting")
                            : t("partnerAccessTokens.edit.submit")}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
