import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { useState } from "react";
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
import { useCreateAccessToken } from "@/features/partner/access-token-management/api/useAccessTokens.ts";
import {
    ACCESS_TOKEN_CREATE_DEFAULT_VALUES,
    type AccessTokenCreateFormData,
    createAccessTokenFormSchema,
} from "@/features/partner/common/components/AccessTokenCreateForm.ts";
import type { CreatedAccessToken } from "@/data/internal/access-tokens/AccessToken.ts";
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
    const [createdAccessToken, setCreatedAccessToken] = useState<CreatedAccessToken | null>(null);
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
        createAccessToken.mutate(
            {
                name: values.name.trim(),
                scopes: values.scopes,
                expiresAt: values.expiresAt ? new Date(values.expiresAt) : undefined,
            },
            {
                onSuccess: (createdToken) => {
                    toast.success(t("partnerAccessTokens.create.success"));
                    setCreatedAccessToken(createdToken);
                    form.reset(defaultValues);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
                showCloseButton={!createAccessToken.isPending}
                onInteractOutside={(e) => {
                    if (createdAccessToken) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>
                        {t(
                            createdAccessToken
                                ? "partnerAccessTokens.create.confirmationTitle"
                                : "partnerAccessTokens.create.title",
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            createdAccessToken
                                ? "partnerAccessTokens.create.confirmationDescription"
                                : "partnerAccessTokens.create.description",
                        )}
                    </DialogDescription>
                </DialogHeader>

                {createdAccessToken ? (
                    <CreatedAccessTokenCredential
                        createdAccessToken={createdAccessToken}
                        onClose={() => handleOpenChange(false)}
                    />
                ) : (
                    <form
                        noValidate
                        className="flex flex-col gap-5"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="access-token-name">
                                {t("partnerAccessTokens.create.fields.name")}
                            </Label>
                            <Input
                                id="access-token-name"
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={createAccessToken.isPending}
                                onClick={() => handleOpenChange(false)}
                            >
                                {t("partnerAccessTokens.create.cancel")}
                            </Button>
                            <Button type="submit" disabled={createAccessToken.isPending}>
                                {createAccessToken.isPending && <Spinner />}
                                {createAccessToken.isPending
                                    ? t("partnerAccessTokens.create.submitting")
                                    : t("partnerAccessTokens.create.submit")}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

function CreatedAccessTokenCredential({
    createdAccessToken,
    onClose,
}: {
    readonly createdAccessToken: CreatedAccessToken;
    readonly onClose: () => void;
}) {
    const { t } = useTranslation();

    const handleCopy = async () => {
        if (!navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(createdAccessToken.plaintextToken);
        toast.success(t("partnerAccessTokens.create.copySuccess"));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="border bg-muted p-3 text-sm">
                {t("partnerAccessTokens.create.copyWarning")}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="created-access-token">
                    {t("partnerAccessTokens.create.fields.token")}
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="created-access-token"
                        value={createdAccessToken.plaintextToken}
                        readOnly
                        className="font-mono"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={t("partnerAccessTokens.create.copy")}
                        onClick={() => void handleCopy()}
                    >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" onClick={onClose}>
                    {t("partnerAccessTokens.create.close")}
                </Button>
            </DialogFooter>
        </div>
    );
}
