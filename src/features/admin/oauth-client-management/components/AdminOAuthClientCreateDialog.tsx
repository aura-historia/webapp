import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Copy } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Form } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useCreateOAuthClient } from "@/features/admin/oauth-client-management/hooks/useAdminOAuthClientActions.ts";
import {
    EMPTY_OAUTH_CLIENT_FORM_VALUES,
    OAUTH_SCOPES,
    OAuthClientFormFields,
    type OAuthClientFormValues,
} from "@/features/admin/oauth-client-management/components/OAuthClientFormFields.tsx";
import {
    isValidHttpsUrl,
    parseRedirectUris,
} from "@/features/admin/oauth-client-management/lib/utils.ts";
import type { OAuthClient } from "@/features/admin/oauth-client-management/types/OAuthClient.ts";
import { toast } from "sonner";

interface AdminOAuthClientCreateDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

function createOAuthClientSchema(t: (key: string) => string) {
    const invalidUriMessage = t("adminDashboard.oauthClients.create.validation.uriInvalid");

    return z.object({
        clientName: z
            .string()
            .trim()
            .min(1, t("adminDashboard.oauthClients.create.validation.nameRequired"))
            .max(255, t("adminDashboard.oauthClients.create.validation.nameTooLong")),
        tosUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        policyUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        clientUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        logoUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        redirectUris: z
            .string()
            .trim()
            .refine(
                (value) => parseRedirectUris(value).length > 0,
                t("adminDashboard.oauthClients.create.validation.redirectUrisRequired"),
            )
            .refine(
                (value) => parseRedirectUris(value).every(isValidHttpsUrl),
                t("adminDashboard.oauthClients.create.validation.redirectUriInvalid"),
            ),
        scope: z.array(z.enum(OAUTH_SCOPES)),
    });
}

export function AdminOAuthClientCreateDialog({
    open,
    onOpenChange,
}: AdminOAuthClientCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {open && <AdminOAuthClientCreateDialogContent onClose={() => onOpenChange(false)} />}
        </Dialog>
    );
}

interface AdminOAuthClientCreateDialogContentProps {
    readonly onClose: () => void;
}

function AdminOAuthClientCreateDialogContent({
    onClose,
}: AdminOAuthClientCreateDialogContentProps) {
    const { t } = useTranslation();
    const schema = useMemo(() => createOAuthClientSchema(t), [t]);
    const createClient = useCreateOAuthClient();
    const [createdClient, setCreatedClient] = useState<OAuthClient | null>(null);
    const form = useForm<OAuthClientFormValues>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_OAUTH_CLIENT_FORM_VALUES,
    });

    const handleSuccess = (client: OAuthClient) => {
        toast.success(t("adminDashboard.oauthClients.create.success"));
        setCreatedClient(client);
        form.reset(EMPTY_OAUTH_CLIENT_FORM_VALUES);
    };

    const handleSubmit = (values: OAuthClientFormValues) => {
        createClient.mutate(
            {
                clientName: values.clientName.trim(),
                tosUri: values.tosUri.trim(),
                policyUri: values.policyUri.trim(),
                clientUri: values.clientUri.trim(),
                logoUri: values.logoUri.trim(),
                redirectUris: parseRedirectUris(values.redirectUris),
                scope: values.scope,
            },
            { onSuccess: handleSuccess },
        );
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>
                    {t(
                        createdClient
                            ? "adminDashboard.oauthClients.create.confirmationTitle"
                            : "adminDashboard.oauthClients.create.title",
                    )}
                </DialogTitle>
                <DialogDescription>
                    {t(
                        createdClient
                            ? "adminDashboard.oauthClients.create.confirmationDescription"
                            : "adminDashboard.oauthClients.create.description",
                    )}
                </DialogDescription>
            </DialogHeader>

            {createdClient ? (
                <CreatedOAuthClientCredentials client={createdClient} onClose={onClose} />
            ) : (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex flex-col gap-4"
                    >
                        <OAuthClientFormFields scopeInputIdPrefix="oauth-client-create-scope" />
                        <OAuthClientCreateFormFooter
                            isPending={createClient.isPending}
                            onCancel={onClose}
                        />
                    </form>
                </Form>
            )}
        </DialogContent>
    );
}

interface CreatedOAuthClientCredentialsProps {
    readonly client: OAuthClient;
    readonly onClose: () => void;
}

function CreatedOAuthClientCredentials({ client, onClose }: CreatedOAuthClientCredentialsProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4">
            <CopyableCredential
                label={t("adminDashboard.oauthClients.clientId")}
                value={client.clientId}
            />
            <CopyableCredential
                label={t("adminDashboard.oauthClients.clientSecret")}
                value={client.clientSecret}
            />
            <DialogFooter>
                <Button type="button" onClick={onClose}>
                    {t("adminDashboard.actions.close")}
                </Button>
            </DialogFooter>
        </div>
    );
}

interface CopyableCredentialProps {
    readonly label: string;
    readonly value: string;
}

function CopyableCredential({ label, value }: CopyableCredentialProps) {
    const { t } = useTranslation();

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(value);
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Input value={value} readOnly className="font-mono" />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => void handleCopy()}
                    aria-label={t("share.copyLink")}
                >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}

interface OAuthClientCreateFormFooterProps {
    readonly isPending: boolean;
    readonly onCancel: () => void;
}

function OAuthClientCreateFormFooter({ isPending, onCancel }: OAuthClientCreateFormFooterProps) {
    const { t } = useTranslation();

    return (
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                {t("adminDashboard.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                {t("adminDashboard.oauthClients.create.submit")}
            </Button>
        </DialogFooter>
    );
}
