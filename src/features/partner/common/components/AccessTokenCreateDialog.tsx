import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AccessTokenScopeData } from "@/client";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
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
    ACCESS_TOKEN_SCOPES,
    type AccessTokenCreateFormData,
    createAccessTokenFormSchema,
} from "@/features/partner/common/components/AccessTokenCreateForm.ts";
import type { CreatedAccessToken } from "@/features/partner/access-token-management/types/AccessToken.ts";

const SCOPE_TRANSLATION_KEYS = {
    "shops:manage": {
        label: "partnerAccessTokens.scopes.shopsManage",
        description: "partnerAccessTokens.create.scopeDescriptions.shopsManage",
    },
    "products:write": {
        label: "partnerAccessTokens.scopes.productsWrite",
        description: "partnerAccessTokens.create.scopeDescriptions.productsWrite",
    },
} as const;

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
                className="sm:max-w-xl"
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
                        />

                        <div className="grid gap-2">
                            <Label htmlFor="access-token-expiration">
                                {t("partnerAccessTokens.create.fields.expiration")}
                            </Label>
                            <Input
                                id="access-token-expiration"
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

export function AccessTokenScopesField({
    value,
    onChange,
}: {
    readonly value: AccessTokenScopeData[];
    readonly onChange: (value: AccessTokenScopeData[]) => void;
}) {
    const { t } = useTranslation();

    return (
        <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">
                {t("partnerAccessTokens.create.fields.scopes")}
            </legend>
            <p className="text-sm text-muted-foreground">
                {t("partnerAccessTokens.create.fields.scopesHint")}
            </p>
            <div className="grid gap-2 pt-1">
                {ACCESS_TOKEN_SCOPES.map((scope) => {
                    const checked = value.includes(scope);
                    const inputId = `access-token-scope-${scope}`;

                    return (
                        <div key={scope} className="flex items-start gap-3 rounded-md border p-3">
                            <Checkbox
                                id={inputId}
                                checked={checked}
                                onCheckedChange={(nextChecked) => {
                                    onChange(
                                        nextChecked === true
                                            ? [...new Set([...value, scope])]
                                            : value.filter((entry) => entry !== scope),
                                    );
                                }}
                            />
                            <div className="grid gap-1">
                                <label
                                    htmlFor={inputId}
                                    className="text-sm font-medium leading-none"
                                >
                                    {t(SCOPE_TRANSLATION_KEYS[scope].label)}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    {t(SCOPE_TRANSLATION_KEYS[scope].description)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </fieldset>
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
