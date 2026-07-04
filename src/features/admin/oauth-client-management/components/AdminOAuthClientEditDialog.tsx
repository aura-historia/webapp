import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { Spinner } from "@/components/ui/spinner.tsx";
import { usePatchOAuthClient } from "@/features/admin/oauth-client-management/hooks/useAdminOAuthClientActions.ts";
import {
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

interface AdminOAuthClientEditDialogProps {
    readonly client: OAuthClient | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

function createOAuthClientSchema(t: (key: string) => string) {
    const invalidUriMessage = t("adminDashboard.oauthClients.edit.validation.uriInvalid");

    return z.object({
        clientName: z
            .string()
            .trim()
            .min(1, t("adminDashboard.oauthClients.edit.validation.nameRequired"))
            .max(255, t("adminDashboard.oauthClients.edit.validation.nameTooLong")),
        tosUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        policyUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        clientUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        logoUri: z.string().trim().refine(isValidHttpsUrl, invalidUriMessage),
        redirectUris: z
            .string()
            .trim()
            .refine(
                (value) => parseRedirectUris(value).length > 0,
                t("adminDashboard.oauthClients.edit.validation.redirectUrisRequired"),
            )
            .refine(
                (value) => parseRedirectUris(value).every(isValidHttpsUrl),
                t("adminDashboard.oauthClients.edit.validation.redirectUriInvalid"),
            ),
        scope: z.array(z.enum(OAUTH_SCOPES)),
    });
}

function getDefaultValues(client: OAuthClient): OAuthClientFormValues {
    return {
        clientName: client.clientName,
        tosUri: client.tosUri,
        policyUri: client.policyUri,
        clientUri: client.clientUri,
        logoUri: client.logoUri,
        redirectUris: client.redirectUris.join("\n"),
        scope: [...client.scope] as OAuthClientFormValues["scope"],
    };
}

export function AdminOAuthClientEditDialog({
    client,
    open,
    onOpenChange,
}: AdminOAuthClientEditDialogProps) {
    if (!client) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {open && (
                <AdminOAuthClientEditDialogContent
                    key={client.clientId}
                    client={client}
                    onClose={() => onOpenChange(false)}
                />
            )}
        </Dialog>
    );
}

interface AdminOAuthClientEditDialogContentProps {
    readonly client: OAuthClient;
    readonly onClose: () => void;
}

function AdminOAuthClientEditDialogContent({
    client,
    onClose,
}: AdminOAuthClientEditDialogContentProps) {
    const { t } = useTranslation();
    const schema = useMemo(() => createOAuthClientSchema(t), [t]);
    const patchClient = usePatchOAuthClient();
    const form = useForm<OAuthClientFormValues>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues(client),
    });

    const handleSuccess = () => {
        toast.success(t("adminDashboard.oauthClients.edit.success"));
        onClose();
    };

    const handleSubmit = (values: OAuthClientFormValues) => {
        patchClient.mutate(
            {
                clientId: client.clientId,
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
                <DialogTitle>{t("adminDashboard.oauthClients.edit.title")}</DialogTitle>
                <DialogDescription>
                    {t("adminDashboard.oauthClients.edit.description", {
                        client: client.clientName,
                    })}
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                    <OAuthClientFormFields scopeInputIdPrefix="oauth-client-edit-scope" />
                    <OAuthClientEditFormFooter
                        isPending={patchClient.isPending}
                        onCancel={onClose}
                    />
                </form>
            </Form>
        </DialogContent>
    );
}

interface OAuthClientEditFormFooterProps {
    readonly isPending: boolean;
    readonly onCancel: () => void;
}

function OAuthClientEditFormFooter({ isPending, onCancel }: OAuthClientEditFormFooterProps) {
    const { t } = useTranslation();

    return (
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                {t("adminDashboard.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Spinner className="mr-2 h-4 w-4" />}
                {t("adminDashboard.actions.save")}
            </Button>
        </DialogFooter>
    );
}
