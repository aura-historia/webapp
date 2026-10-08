import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import type { AccessTokenScope } from "@/data/internal/access-tokens/AccessTokenScope.ts";
import {
    ACCESS_TOKEN_SCOPE_METADATA,
    ACCESS_TOKEN_SCOPES,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type {
    AdminOAuthClient,
    AdminOAuthClientMetadataInput,
} from "@/data/internal/admin/AdminOAuthClient.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
    AdminOAuthClientRequestError,
    useCreateAdminOAuthClient,
    useUpdateAdminOAuthClient,
} from "../api/useAdminOAuthClients.ts";

const isHttpsUrl = (value: string) => {
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
};

const isRedirectUri = (value: string) => {
    try {
        const url = new URL(value);
        return url.protocol === "https:" && url.hash.length === 0;
    } catch {
        return false;
    }
};

const urlSchema = (message: string) =>
    z.string().trim().min(1, "adminOAuthClients.validation.required").refine(isHttpsUrl, message);

const formSchema = z.object({
    clientName: z.string().trim().min(1, "adminOAuthClients.validation.nameRequired"),
    tosUri: urlSchema("adminOAuthClients.validation.httpsUrl"),
    policyUri: urlSchema("adminOAuthClients.validation.httpsUrl"),
    clientUri: urlSchema("adminOAuthClients.validation.httpsUrl"),
    logoUri: urlSchema("adminOAuthClients.validation.httpsUrl"),
    redirectUrisText: z
        .string()
        .transform((value) =>
            value
                .split(/\r?\n/)
                .map((uri) => uri.trim())
                .filter(Boolean),
        )
        .refine((uris) => uris.length > 0, "adminOAuthClients.validation.redirectRequired")
        .refine((uris) => uris.every(isRedirectUri), "adminOAuthClients.validation.redirectInvalid")
        .refine(
            (uris) => new Set(uris).size === uris.length,
            "adminOAuthClients.validation.redirectDuplicate",
        ),
    scopes: z.array(z.enum(ACCESS_TOKEN_SCOPES)),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;
type Scope = AccessTokenScope;
type DirtyValues = Partial<Record<keyof FormInput, unknown>>;

function defaults(client?: AdminOAuthClient): FormInput {
    return {
        clientName: client?.clientName ?? "",
        tosUri: client?.tosUri ?? "",
        policyUri: client?.policyUri ?? "",
        clientUri: client?.clientUri ?? "",
        logoUri: client?.logoUri ?? "",
        redirectUrisText: client?.redirectUris.join("\n") ?? "",
        scopes: [...(client?.scopes ?? [])],
    };
}

function toMetadataInput(values: FormValues): AdminOAuthClientMetadataInput {
    return {
        clientName: values.clientName,
        tosUri: values.tosUri,
        policyUri: values.policyUri,
        clientUri: values.clientUri,
        logoUri: values.logoUri,
        redirectUris: values.redirectUrisText,
        scopes: values.scopes,
    };
}

function toPatch(values: FormValues, dirty: DirtyValues): Partial<AdminOAuthClientMetadataInput> {
    const isDirty = (field: keyof FormInput) => Boolean(dirty[field]);
    return {
        ...(isDirty("clientName") ? { clientName: values.clientName } : {}),
        ...(isDirty("tosUri") ? { tosUri: values.tosUri } : {}),
        ...(isDirty("policyUri") ? { policyUri: values.policyUri } : {}),
        ...(isDirty("clientUri") ? { clientUri: values.clientUri } : {}),
        ...(isDirty("logoUri") ? { logoUri: values.logoUri } : {}),
        ...(isDirty("redirectUrisText") ? { redirectUris: values.redirectUrisText } : {}),
        // An empty array is intentionally preserved so administrators can clear all scopes.
        ...(isDirty("scopes") ? { scopes: values.scopes } : {}),
    };
}

function errorMessage(error: unknown, fallback: string) {
    return error instanceof AdminOAuthClientRequestError ? error.message : fallback;
}

export function AdminOAuthClientFormDialog({
    mode,
    client,
    open,
    onOpenChange,
}: {
    readonly mode: "create" | "edit";
    readonly client?: AdminOAuthClient;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const create = useCreateAdminOAuthClient();
    const update = useUpdateAdminOAuthClient();
    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaults(client),
    });
    const { dirtyFields, isDirty } = form.formState;
    const requestPendingRef = useRef(false);
    const [createdClient, setCreatedClient] = useState<{
        readonly clientId: string;
        readonly clientSecret: string;
    }>();
    const [requestError, setRequestError] = useState<string>();

    const clearDialogState = () => {
        setCreatedClient(undefined);
        setRequestError(undefined);
        form.reset(defaults(client));
        create.reset();
        update.reset();
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && requestPendingRef.current) return;
        if (!nextOpen) {
            // The plaintext create secret is shown only while this dialog remains open.
            clearDialogState();
        }
        onOpenChange(nextOpen);
    };

    const onSubmit = form.handleSubmit(async (values) => {
        setRequestError(undefined);
        requestPendingRef.current = true;
        try {
            if (mode === "create") {
                setCreatedClient(await create.mutateAsync(toMetadataInput(values)));
                return;
            }
            if (!client) return;
            await update.mutateAsync({
                clientId: client.clientId,
                patch: toPatch(values, dirtyFields as DirtyValues),
            });
            toast.success(t("adminOAuthClients.success.updated"));
            clearDialogState();
            onOpenChange(false);
        } catch (error) {
            setRequestError(errorMessage(error, t("adminOAuthClients.errors.requestFailed")));
        } finally {
            requestPendingRef.current = false;
        }
    });

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
                closeLabel={t("adminOAuthClients.actions.close")}
            >
                {createdClient ? (
                    <div className="grid gap-5">
                        <DialogHeader>
                            <DialogTitle>{t("adminOAuthClients.create.secretTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("adminOAuthClients.create.secretDescription")}
                            </DialogDescription>
                        </DialogHeader>
                        <dl className="grid gap-3 rounded-md border bg-surface-container-low p-4">
                            <div className="grid gap-1">
                                <dt className="text-sm text-muted-foreground">
                                    {t("adminOAuthClients.fields.clientId")}
                                </dt>
                                <dd className="break-all font-mono text-sm">
                                    {createdClient.clientId}
                                </dd>
                            </div>
                            <div className="grid gap-1">
                                <dt className="text-sm text-muted-foreground">
                                    {t("adminOAuthClients.fields.clientSecret")}
                                </dt>
                                <dd className="break-all rounded bg-background p-3 font-mono text-sm">
                                    {createdClient.clientSecret}
                                </dd>
                            </div>
                        </dl>
                        <DialogFooter>
                            <Button type="button" onClick={() => handleOpenChange(false)}>
                                {t("adminOAuthClients.actions.close")}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form className="grid gap-5" onSubmit={onSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {t(
                                    mode === "create"
                                        ? "adminOAuthClients.create.title"
                                        : "adminOAuthClients.edit.title",
                                )}
                            </DialogTitle>
                            <DialogDescription>
                                {t(
                                    mode === "create"
                                        ? "adminOAuthClients.create.description"
                                        : "adminOAuthClients.edit.description",
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                form={form}
                                name="clientName"
                                label={t("adminOAuthClients.fields.name")}
                                error={form.formState.errors.clientName?.message}
                                autoComplete="off"
                            />
                            <FormField
                                form={form}
                                name="tosUri"
                                label={t("adminOAuthClients.fields.terms")}
                                error={form.formState.errors.tosUri?.message}
                            />
                            <FormField
                                form={form}
                                name="policyUri"
                                label={t("adminOAuthClients.fields.privacy")}
                                error={form.formState.errors.policyUri?.message}
                            />
                            <FormField
                                form={form}
                                name="clientUri"
                                label={t("adminOAuthClients.fields.homepage")}
                                error={form.formState.errors.clientUri?.message}
                            />
                            <FormField
                                form={form}
                                name="logoUri"
                                label={t("adminOAuthClients.fields.logo")}
                                error={form.formState.errors.logoUri?.message}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin-oauth-redirect-uris">
                                {t("adminOAuthClients.fields.redirectUris")}
                            </Label>
                            <Textarea
                                id="admin-oauth-redirect-uris"
                                rows={3}
                                autoComplete="off"
                                aria-invalid={Boolean(form.formState.errors.redirectUrisText)}
                                aria-describedby={
                                    form.formState.errors.redirectUrisText
                                        ? "admin-oauth-redirect-uris-error"
                                        : undefined
                                }
                                {...form.register("redirectUrisText")}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("adminOAuthClients.fields.redirectUrisHelp")}
                            </p>
                            {form.formState.errors.redirectUrisText?.message && (
                                <p
                                    id="admin-oauth-redirect-uris-error"
                                    className="text-sm text-destructive"
                                    role="alert"
                                >
                                    {t(form.formState.errors.redirectUrisText.message)}
                                </p>
                            )}
                        </div>

                        <fieldset className="grid gap-3">
                            <legend className="font-medium">
                                {t("adminOAuthClients.fields.scopes")}
                            </legend>
                            <p className="text-xs text-muted-foreground">
                                {t("adminOAuthClients.fields.scopesHelp")}
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {ACCESS_TOKEN_SCOPES.map((scope) => (
                                    <ScopeCheckbox key={scope} form={form} scope={scope} />
                                ))}
                            </div>
                        </fieldset>

                        {requestError && (
                            <p className="text-sm text-destructive" role="alert">
                                {requestError}
                            </p>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                {t("adminOAuthClients.actions.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    create.isPending ||
                                    update.isPending ||
                                    (mode === "edit" && !isDirty)
                                }
                            >
                                {create.isPending || update.isPending
                                    ? t("adminOAuthClients.actions.saving")
                                    : t(
                                          mode === "create"
                                              ? "adminOAuthClients.actions.create"
                                              : "adminOAuthClients.actions.save",
                                      )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

function FormField({
    form,
    name,
    label,
    error,
    autoComplete,
}: {
    readonly form: ReturnType<typeof useForm<FormInput, unknown, FormValues>>;
    readonly name: "clientName" | "tosUri" | "policyUri" | "clientUri" | "logoUri";
    readonly label: string;
    readonly error?: string;
    readonly autoComplete?: string;
}) {
    const { t } = useTranslation();
    const id = `admin-oauth-${name}`;
    return (
        <div className="grid min-w-0 gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                autoComplete={autoComplete ?? "url"}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                {...form.register(name)}
            />
            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
                    {form.formState.errors[name]?.message &&
                        // Validation messages are translation keys, never raw Zod diagnostics.
                        t(error)}
                </p>
            )}
        </div>
    );
}

function ScopeCheckbox({
    form,
    scope,
}: {
    readonly form: ReturnType<typeof useForm<FormInput, unknown, FormValues>>;
    readonly scope: Scope;
}) {
    const { t } = useTranslation();
    const label = ACCESS_TOKEN_SCOPE_METADATA[scope];
    return (
        <label className="flex items-start gap-2 rounded border bg-background p-3 text-sm">
            <input
                type="checkbox"
                value={scope}
                className="mt-1 accent-primary"
                {...form.register("scopes")}
            />
            <span className="grid gap-1">
                <span className="font-medium">{t(label.label)}</span>
                <span className="text-xs text-muted-foreground">{t(label.description)}</span>
            </span>
        </label>
    );
}
