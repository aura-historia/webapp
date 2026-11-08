import { zodResolver } from "@hookform/resolvers/zod";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useUpdateAccessToken } from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import { AccessTokenScopesField } from "@/features/partner/common/components/AccessTokenScopesField.tsx";
import { AccessTokenExpirationField } from "@/features/partner/common/components/AccessTokenExpirationField.tsx";
import {
    type AccessTokenCreateFormData,
    createAccessTokenFormSchema,
} from "@/features/partner/common/components/AccessTokenCreateForm.ts";
import type { AccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import type { AccessTokenScope } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    DIALOG_CONTENT_CLASS,
    DIALOG_DESCRIPTION_CLASS,
    DIALOG_TITLE_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { cn } from "@/lib/utils.ts";

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

/** Order-insensitive: selecting and clearing back to the saved grants is not a change. */
function hasSameScopes(
    scopes: readonly AccessTokenScope[],
    savedScopes: readonly AccessTokenScope[],
): boolean {
    const saved = new Set(savedScopes);
    const next = new Set(scopes);
    return next.size === saved.size && [...next].every((scope) => saved.has(scope));
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
    const { dirtyFields } = form.formState;

    const handleSubmit = (values: AccessTokenCreateFormData) => {
        let expiresAt: Date | null | undefined;
        if (dirtyFields.expiresAt) {
            expiresAt = values.expiresAt ? new Date(values.expiresAt) : null;
        }
        updateAccessToken.mutate(
            {
                id: accessToken.id,
                name: dirtyFields.name ? values.name.trim() : undefined,
                scopes: hasSameScopes(values.scopes, accessToken.scopes)
                    ? undefined
                    : values.scopes,
                expiresAt,
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
        <DialogContent
            className={cn(
                DIALOG_CONTENT_CLASS,
                "max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-7 sm:max-w-[640px]",
            )}
            closeLabel={t("partnerDashboard.close")}
            showCloseButton={!updateAccessToken.isPending}
        >
            <div className="flex flex-col gap-1.5 pr-8">
                <DialogTitle className={DIALOG_TITLE_CLASS}>
                    {t("partnerAccessTokens.edit.title")}
                </DialogTitle>
                <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                    {t("partnerAccessTokens.edit.description", { name: accessToken.name })}
                </DialogDescription>
            </div>

            <form
                noValidate
                className="flex flex-col gap-5"
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="access-token-edit-name"
                        data-error={Boolean(form.formState.errors.name)}
                        className={FIELD_LABEL_CLASS}
                    >
                        {t("partnerAccessTokens.create.fields.name")}
                    </label>
                    <input
                        id="access-token-edit-name"
                        autoComplete="off"
                        maxLength={128}
                        aria-invalid={Boolean(form.formState.errors.name)}
                        className={FIELD_CLASS}
                        {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                        <p className={FIELD_ERROR_CLASS}>{form.formState.errors.name.message}</p>
                    )}
                </div>

                <AccessTokenScopesField
                    value={scopesField.value}
                    onChange={scopesField.onChange}
                    disabled={updateAccessToken.isPending}
                />

                <AccessTokenExpirationField
                    id="access-token-edit-expiration"
                    control={form.control}
                    disabled={updateAccessToken.isPending}
                />

                <div className="flex flex-wrap justify-end gap-2.5 pt-1">
                    <button
                        type="button"
                        className={SECONDARY_PILL_CLASS}
                        disabled={updateAccessToken.isPending}
                        onClick={onClose}
                    >
                        {t("partnerAccessTokens.edit.cancel")}
                    </button>
                    <button
                        type="submit"
                        className={PRIMARY_PILL_CLASS}
                        disabled={updateAccessToken.isPending}
                    >
                        {updateAccessToken.isPending && <Spinner aria-hidden="true" />}
                        {updateAccessToken.isPending
                            ? t("partnerAccessTokens.edit.submitting")
                            : t("partnerAccessTokens.edit.submit")}
                    </button>
                </div>
            </form>
        </DialogContent>
    );
}
