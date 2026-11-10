import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import {
    ACCESS_TOKEN_SCOPE_GROUPS,
    ACCESS_TOKEN_SCOPE_METADATA,
    ACCESS_TOKEN_SCOPES,
    type AccessTokenScope,
} from "@/data/internal/access-tokens/AccessTokenScope.ts";
import type {
    AdminOAuthClient,
    AdminOAuthClientMetadataInput,
} from "@/data/internal/admin/AdminOAuthClient.ts";
import { AdminRecordDialog } from "@/features/admin/common/components/AdminRecordDialog.tsx";
import {
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FIELD_LABEL_CLASS,
    INLINE_ALERT_CLASS,
    MONO_LABEL_CLASS,
    PRIMARY_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/admin/common/lib/adminStyles.ts";
import { cn } from "@/lib/utils.ts";
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

const urlSchema = z
    .string()
    .trim()
    .min(1, "adminOAuthClients.validation.required")
    .refine(isHttpsUrl, "adminOAuthClients.validation.httpsUrl");

const formSchema = z.object({
    clientName: z.string().trim().min(1, "adminOAuthClients.validation.nameRequired"),
    clientUri: urlSchema,
    tosUri: urlSchema,
    policyUri: urlSchema,
    logoUri: urlSchema,
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
type DirtyValues = Partial<Record<keyof FormInput, unknown>>;
type UrlFieldName = "clientUri" | "tosUri" | "policyUri" | "logoUri";

const URL_FIELDS: readonly { readonly name: UrlFieldName; readonly label: string }[] = [
    { name: "clientUri", label: "adminOAuthClients.fields.homepageShort" },
    { name: "tosUri", label: "adminOAuthClients.fields.termsShort" },
    { name: "policyUri", label: "adminOAuthClients.fields.privacyShort" },
    { name: "logoUri", label: "adminOAuthClients.fields.logo" },
];

function defaults(client?: AdminOAuthClient): FormInput {
    return {
        clientName: client?.clientName ?? "",
        clientUri: client?.clientUri ?? "",
        tosUri: client?.tosUri ?? "",
        policyUri: client?.policyUri ?? "",
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

type CreatedClient = { readonly clientId: string; readonly clientSecret: string };

/**
 * Creates or edits an OAuth client (board "Admin · OAuth client dialogs", form and secret). After
 * creation the same dialog shows the client ID and the plaintext secret once; it cannot be
 * dismissed by Escape or an outside click, and the secret is cleared when it closes.
 */
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
    const { dirtyFields, isDirty, errors } = form.formState;
    const requestPendingRef = useRef(false);
    const [createdClient, setCreatedClient] = useState<CreatedClient>();
    const [requestError, setRequestError] = useState<string>();
    const { reset: resetForm } = form;
    const redirectId = useId();

    useEffect(() => {
        // Reused instances must edit the latest client record, not the metadata from first mount.
        if (open) resetForm(defaults(client));
    }, [open, client, resetForm]);

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
            setRequestError(
                error instanceof AdminOAuthClientRequestError
                    ? error.message
                    : t("adminOAuthClients.errors.requestFailed"),
            );
        } finally {
            requestPendingRef.current = false;
        }
    });

    const isSaving = create.isPending || update.isPending;
    const redirectError = errors.redirectUrisText?.message;
    const keepSecretOpen = (event: Event) => {
        if (createdClient) event.preventDefault();
    };

    return (
        <AdminRecordDialog
            open={open}
            onOpenChange={handleOpenChange}
            width="md"
            closable={!createdClient}
            onInteractOutside={keepSecretOpen}
            onEscapeKeyDown={keepSecretOpen}
            eyebrow={
                createdClient ? (
                    <span className="inline-flex items-center gap-2 text-ink-secondary">
                        <span
                            aria-hidden="true"
                            className="inline-flex size-[18px] items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                        >
                            <Check className="size-2.5" strokeWidth={3} />
                        </span>
                        {t("adminOAuthClients.secret.eyebrow")}
                    </span>
                ) : undefined
            }
            title={
                createdClient
                    ? t("adminOAuthClients.secret.title")
                    : mode === "edit" && client
                      ? t("adminOAuthClients.form.editNamed", { name: client.clientName })
                      : t("adminOAuthClients.form.newTitle")
            }
        >
            {createdClient ? (
                <>
                    <div
                        data-theme="dark"
                        className="flex flex-col gap-3.5 rounded-md bg-surface p-4 text-ink"
                    >
                        <SecretField
                            label={t("adminOAuthClients.fields.clientId")}
                            value={createdClient.clientId}
                        />
                        <SecretField
                            label={t("adminOAuthClients.fields.clientSecret")}
                            value={createdClient.clientSecret}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleOpenChange(false)}
                            className={PRIMARY_PILL_CLASS}
                        >
                            {t("adminOAuthClients.actions.done")}
                        </button>
                    </div>
                </>
            ) : (
                <form noValidate className="flex flex-col gap-5" onSubmit={onSubmit}>
                    <TextField
                        label={t("adminOAuthClients.fields.name")}
                        registration={form.register("clientName")}
                        error={errors.clientName?.message}
                        autoComplete="off"
                    />
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                        {URL_FIELDS.map((field) => (
                            <TextField
                                key={field.name}
                                label={t(field.label)}
                                registration={form.register(field.name)}
                                error={errors[field.name]?.message}
                                type="url"
                                autoComplete="url"
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={redirectId}
                            className={FIELD_LABEL_CLASS}
                            data-error={redirectError ? "true" : undefined}
                        >
                            {t("adminOAuthClients.fields.redirectUris")}
                        </label>
                        <textarea
                            id={redirectId}
                            rows={3}
                            autoComplete="off"
                            spellCheck={false}
                            aria-invalid={redirectError ? true : undefined}
                            aria-describedby={
                                redirectError
                                    ? `${redirectId}-hint ${redirectId}-error`
                                    : `${redirectId}-hint`
                            }
                            {...form.register("redirectUrisText")}
                            className={cn(
                                FIELD_CLASS,
                                "h-auto min-h-24 resize-y py-2.5 font-mono text-[13px] leading-relaxed",
                            )}
                        />
                        <p id={`${redirectId}-hint`} className="text-xs text-ink-muted">
                            {t("adminOAuthClients.fields.redirectUrisHint")}
                        </p>
                        {redirectError && (
                            <p id={`${redirectId}-error`} className={FIELD_ERROR_CLASS}>
                                {t(redirectError)}
                            </p>
                        )}
                    </div>
                    <fieldset className="flex min-w-0 flex-col gap-3">
                        <legend className={cn(FIELD_LABEL_CLASS, "mb-2")}>
                            {t("adminOAuthClients.fields.scopes")}
                        </legend>
                        {ACCESS_TOKEN_SCOPE_GROUPS.map((group) => (
                            <fieldset key={group.label} className="flex min-w-0 flex-col gap-2">
                                <legend className={cn(MONO_LABEL_CLASS, "mb-2")}>
                                    {t(group.label)}
                                </legend>
                                <div className="rounded-md bg-surface px-3.5 py-1 shadow-ring">
                                    {group.scopes.map((scope) => (
                                        <ScopeCheckbox
                                            key={scope}
                                            scope={scope}
                                            registration={form.register("scopes")}
                                        />
                                    ))}
                                </div>
                            </fieldset>
                        ))}
                    </fieldset>
                    {requestError && (
                        <p role="alert" className={INLINE_ALERT_CLASS}>
                            <TriangleAlert
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-oxblood"
                                strokeWidth={2}
                            />
                            {requestError}
                        </p>
                    )}
                    <div className="flex flex-wrap justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => handleOpenChange(false)}
                            className={SECONDARY_PILL_CLASS}
                        >
                            {t("adminCommon.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || (mode === "edit" && !isDirty)}
                            aria-busy={isSaving}
                            className={PRIMARY_PILL_CLASS}
                        >
                            {isSaving
                                ? t("adminCommon.saving")
                                : t(
                                      mode === "create"
                                          ? "adminOAuthClients.actions.create"
                                          : "adminCommon.save",
                                  )}
                        </button>
                    </div>
                </form>
            )}
        </AdminRecordDialog>
    );
}

function TextField({
    label,
    registration,
    error,
    type = "text",
    autoComplete,
}: {
    readonly label: string;
    readonly registration: UseFormRegisterReturn;
    /** A translation key. */
    readonly error?: string;
    readonly type?: "text" | "url";
    readonly autoComplete?: string;
}) {
    const { t } = useTranslation();
    const id = useId();
    const errorId = `${id}-error`;
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label
                htmlFor={id}
                className={FIELD_LABEL_CLASS}
                data-error={error ? "true" : undefined}
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                autoComplete={autoComplete}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                {...registration}
                className={cn(FIELD_CLASS, type === "url" && "text-sm")}
            />
            {error && (
                <p id={errorId} className={FIELD_ERROR_CLASS}>
                    {/* Validation messages are translation keys, never raw Zod diagnostics. */}
                    {t(error)}
                </p>
            )}
        </div>
    );
}

function ScopeCheckbox({
    scope,
    registration,
}: {
    readonly scope: AccessTokenScope;
    readonly registration: UseFormRegisterReturn;
}) {
    const { t } = useTranslation();
    return (
        <label className="flex cursor-pointer items-start gap-2.5 border-b border-line-subtle py-2.5 last:border-b-0">
            <input
                type="checkbox"
                value={scope}
                {...registration}
                className="mt-0.5 size-[17px] shrink-0 accent-oxblood"
            />
            <span className="text-sm font-medium">
                {t(ACCESS_TOKEN_SCOPE_METADATA[scope].label)}
            </span>
        </label>
    );
}

/** A read-only mono value on the ink panel with its own Copy button. */
function SecretField({ label, value }: { readonly label: string; readonly value: string }) {
    const { t } = useTranslation();
    const id = useId();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(timer);
    }, [copied]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        } catch {
            toast.error(t("adminOAuthClients.secret.copyFailed"));
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={id}
                className="font-mono text-[10px] tracking-[0.14em] text-brass-light uppercase"
            >
                {label}
            </label>
            <div className="flex items-center gap-2.5">
                <input
                    id={id}
                    readOnly
                    value={value}
                    spellCheck={false}
                    onFocus={(event) => event.currentTarget.select()}
                    className="h-11 min-w-0 flex-1 rounded-sm border-0 bg-surface-raised px-3 font-mono text-[13px] text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                />
                <button
                    type="button"
                    onClick={() => void copy()}
                    aria-label={
                        copied
                            ? t("adminCommon.copied")
                            : t("adminOAuthClients.secret.copyNamed", { field: label })
                    }
                    className={PRIMARY_PILL_CLASS}
                >
                    {copied ? (
                        <Check aria-hidden="true" className="size-[15px]" strokeWidth={1.9} />
                    ) : (
                        <Copy aria-hidden="true" className="size-[15px]" strokeWidth={1.9} />
                    )}
                    {copied ? t("adminCommon.copied") : t("adminCommon.copy")}
                </button>
            </div>
        </div>
    );
}
