import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useCreateAccessToken } from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import {
    ACCESS_TOKEN_CREATE_DEFAULT_VALUES,
    type AccessTokenCreateFormData,
    createAccessTokenFormSchema,
} from "@/features/partner/common/components/AccessTokenCreateForm.ts";
import {
    DIALOG_CONTENT_CLASS,
    DIALOG_DESCRIPTION_CLASS,
    DIALOG_TITLE_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    FOCUS_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/partner/common/lib/partnerDashboardStyles.ts";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import type { CreatedAccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
import { cn } from "@/lib/utils.ts";
import { AccessTokenExpirationField } from "./AccessTokenExpirationField.tsx";
import { AccessTokenScopesField } from "./AccessTokenScopesField.tsx";

interface AccessTokenCreateDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly defaultValues?: AccessTokenCreateFormData;
}

export function AccessTokenCreateDialog({
    open,
    onOpenChange,
    defaultValues = ACCESS_TOKEN_CREATE_DEFAULT_VALUES,
}: AccessTokenCreateDialogProps) {
    const { t } = useTranslation();
    const createAccessToken = useCreateAccessToken();
    const [createdAccessToken, setCreatedAccessToken] = useState<
        (CreatedAccessToken & { readonly name: string }) | null
    >(null);
    const form = useForm<AccessTokenCreateFormData>({
        resolver: zodResolver(createAccessTokenFormSchema(t)),
        defaultValues,
    });
    const scopesField = useController({ control: form.control, name: "scopes" }).field;

    const resetDialog = () => {
        form.reset(defaultValues);
        setCreatedAccessToken(null);
        createAccessToken.reset();
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (createAccessToken.isPending) {
            return;
        }

        if (!nextOpen) {
            resetDialog();
        }
        onOpenChange(nextOpen);
    };

    const handleSubmit = (values: AccessTokenCreateFormData) => {
        const name = values.name.trim();
        createAccessToken.mutate(
            {
                name,
                scopes: values.scopes,
                expiresAt: values.expiresAt ? new Date(values.expiresAt) : undefined,
            },
            {
                onSuccess: (createdToken) => {
                    toast.success(t("partnerAccessTokens.create.success"));
                    setCreatedAccessToken({ ...createdToken, name });
                    form.reset(defaultValues);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className={cn(
                    DIALOG_CONTENT_CLASS,
                    "max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-7 sm:max-w-[640px]",
                )}
                closeLabel={t("partnerDashboard.close")}
                showCloseButton={!createAccessToken.isPending && !createdAccessToken}
                onInteractOutside={(e) => {
                    if (createdAccessToken) {
                        e.preventDefault();
                    }
                }}
            >
                {createdAccessToken ? (
                    <CreatedAccessTokenCredential
                        createdAccessToken={createdAccessToken}
                        onClose={() => handleOpenChange(false)}
                    />
                ) : (
                    <>
                        <div className="flex flex-col gap-1.5 pr-8">
                            <DialogTitle className={DIALOG_TITLE_CLASS}>
                                {t("partnerAccessTokens.create.title")}
                            </DialogTitle>
                            <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                                {t("partnerAccessTokens.create.description")}
                            </DialogDescription>
                        </div>
                        <form
                            noValidate
                            className="flex flex-col gap-5"
                            onSubmit={form.handleSubmit(handleSubmit)}
                        >
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="access-token-name"
                                    data-error={Boolean(form.formState.errors.name)}
                                    className={FIELD_LABEL_CLASS}
                                >
                                    {t("partnerAccessTokens.create.fields.name")}
                                </label>
                                <input
                                    id="access-token-name"
                                    autoComplete="off"
                                    maxLength={128}
                                    aria-invalid={Boolean(form.formState.errors.name)}
                                    className={FIELD_CLASS}
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <p className={FIELD_ERROR_CLASS}>
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <AccessTokenScopesField
                                value={scopesField.value}
                                onChange={scopesField.onChange}
                                disabled={createAccessToken.isPending}
                            />

                            <AccessTokenExpirationField
                                id="access-token-expiration"
                                control={form.control}
                                disabled={createAccessToken.isPending}
                            />

                            <div className="flex flex-wrap justify-end gap-2.5 pt-1">
                                <button
                                    type="button"
                                    className={SECONDARY_PILL_CLASS}
                                    disabled={createAccessToken.isPending}
                                    onClick={() => handleOpenChange(false)}
                                >
                                    {t("partnerAccessTokens.create.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className={PRIMARY_PILL_CLASS}
                                    disabled={createAccessToken.isPending}
                                >
                                    {createAccessToken.isPending && <Spinner aria-hidden="true" />}
                                    {createAccessToken.isPending
                                        ? t("partnerAccessTokens.create.submitting")
                                        : t("partnerAccessTokens.create.submit")}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

/** The one-time token view (board "Access tokens — token created"): shown once, copied, then closed. */
function CreatedAccessTokenCredential({
    createdAccessToken,
    onClose,
}: {
    readonly createdAccessToken: CreatedAccessToken & { readonly name: string };
    readonly onClose: () => void;
}) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(createdAccessToken.plaintextToken);
        setCopied(true);
        toast.success(t("partnerAccessTokens.create.copySuccess"));
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-ink-secondary uppercase">
                    <span
                        aria-hidden="true"
                        className="inline-flex size-[18px] items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                    >
                        <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    {t("partnerAccessTokens.create.createdLabel")}
                </span>
                <DialogTitle className={DIALOG_TITLE_CLASS}>
                    <Trans
                        i18nKey="partnerAccessTokens.create.createdHeading"
                        components={HEADLINE_COMPONENTS}
                    />
                </DialogTitle>
                <DialogDescription className={DIALOG_DESCRIPTION_CLASS}>
                    {t("partnerAccessTokens.create.createdDescription", {
                        name: createdAccessToken.name,
                    })}
                </DialogDescription>
            </div>
            <div
                data-theme="dark"
                className="relative flex flex-col gap-3 rounded-md bg-surface p-4 text-ink"
            >
                <label
                    htmlFor="created-access-token"
                    className="font-mono text-[10px] tracking-[0.14em] text-brass-light uppercase"
                >
                    {t("partnerAccessTokens.create.fields.token")}
                </label>
                <div className="flex items-center gap-2.5">
                    <input
                        id="created-access-token"
                        value={createdAccessToken.plaintextToken}
                        readOnly
                        className={cn(
                            "h-11 min-w-0 flex-1 rounded-sm border-0 bg-surface-raised px-3 font-mono text-meta text-ink",
                            FOCUS_CLASS,
                        )}
                    />
                    <button
                        type="button"
                        aria-label={t("partnerAccessTokens.create.copy")}
                        onClick={() => void handleCopy()}
                        className={PRIMARY_PILL_CLASS}
                    >
                        {copied ? (
                            <Check aria-hidden="true" className="size-[15px]" strokeWidth={1.9} />
                        ) : (
                            <Copy aria-hidden="true" className="size-[15px]" strokeWidth={1.9} />
                        )}
                        <span aria-hidden="true">
                            {t(
                                copied
                                    ? "partnerAccessTokens.create.copied"
                                    : "partnerAccessTokens.create.copyShort",
                            )}
                        </span>
                    </button>
                </div>
            </div>
            <p className="text-meta text-ink-muted">{t("partnerAccessTokens.create.keepSafe")}</p>
            <div className="flex justify-end">
                <button type="button" className={PRIMARY_PILL_CLASS} onClick={onClose}>
                    {t("partnerAccessTokens.create.close")}
                </button>
            </div>
        </div>
    );
}
