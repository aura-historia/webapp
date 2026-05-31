import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import type { AccessTokenScopeData } from "@/client";
import type { OAuthClient } from "@/data/internal/oauth/OAuthClient.ts";
import { usePatchOAuthClient } from "@/hooks/admin/useAdminOAuthClientActions.ts";
import { toast } from "sonner";

const OAUTH_SCOPES = [
    "shops:manage",
    "products:write",
] as const satisfies readonly AccessTokenScopeData[];

interface AdminOAuthClientEditDialogProps {
    readonly client: OAuthClient | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

function parseRedirectUris(value: string): string[] {
    return value
        .split("\n")
        .map((uri) => uri.trim())
        .filter(Boolean);
}

function isValidHttpsUrl(value: string): boolean {
    if (!z.url().safeParse(value).success) {
        return false;
    }

    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
}

function createOAuthClientSchema(t: (key: string) => string) {
    return z.object({
        clientName: z
            .string()
            .trim()
            .min(1, t("adminDashboard.oauthClients.edit.validation.nameRequired"))
            .max(255, t("adminDashboard.oauthClients.edit.validation.nameTooLong")),
        tosUri: z
            .string()
            .trim()
            .refine(isValidHttpsUrl, t("adminDashboard.oauthClients.edit.validation.uriInvalid")),
        policyUri: z
            .string()
            .trim()
            .refine(isValidHttpsUrl, t("adminDashboard.oauthClients.edit.validation.uriInvalid")),
        clientUri: z
            .string()
            .trim()
            .refine(isValidHttpsUrl, t("adminDashboard.oauthClients.edit.validation.uriInvalid")),
        logoUri: z
            .string()
            .trim()
            .refine(isValidHttpsUrl, t("adminDashboard.oauthClients.edit.validation.uriInvalid")),
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

type AdminOAuthClientEditFormData = z.infer<ReturnType<typeof createOAuthClientSchema>>;

const DEFAULT_VALUES: AdminOAuthClientEditFormData = {
    clientName: "",
    tosUri: "",
    policyUri: "",
    clientUri: "",
    logoUri: "",
    redirectUris: "",
    scope: [],
};

export function AdminOAuthClientEditDialog({
    client,
    open,
    onOpenChange,
}: AdminOAuthClientEditDialogProps) {
    const { t } = useTranslation();
    const schema = useMemo(() => createOAuthClientSchema(t), [t]);
    const patchClient = usePatchOAuthClient();

    const form = useForm<AdminOAuthClientEditFormData>({
        resolver: zodResolver(schema),
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (!open || !client) {
            return;
        }

        form.reset({
            clientName: client.clientName,
            tosUri: client.tosUri,
            policyUri: client.policyUri,
            clientUri: client.clientUri,
            logoUri: client.logoUri,
            redirectUris: client.redirectUris.join("\n"),
            scope: [...client.scope] as AccessTokenScopeData[],
        });
    }, [client, form, open]);

    if (!client) {
        return null;
    }

    const onSubmit = (values: AdminOAuthClientEditFormData) => {
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
            {
                onSuccess: () => {
                    toast.success(t("adminDashboard.oauthClients.edit.success"));
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("adminDashboard.oauthClients.fields.clientName")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} maxLength={255} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="clientUri"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("adminDashboard.oauthClients.fields.clientUri")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="url" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="logoUri"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("adminDashboard.oauthClients.fields.logoUri")}
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="url" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="tosUri"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("adminDashboard.oauthClients.fields.tosUri")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} type="url" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="policyUri"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("adminDashboard.oauthClients.fields.policyUri")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} type="url" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="redirectUris"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("adminDashboard.oauthClients.fields.redirectUris")}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea {...field} className="min-h-[120px]" />
                                    </FormControl>
                                    <FormDescription>
                                        {t("adminDashboard.oauthClients.fields.redirectUrisHint")}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="scope"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("adminDashboard.oauthClients.fields.scope")}
                                    </FormLabel>
                                    <FormDescription>
                                        {t("adminDashboard.oauthClients.fields.scopeHint")}
                                    </FormDescription>
                                    <div className="grid gap-2 pt-1">
                                        {OAUTH_SCOPES.map((scope) => {
                                            const checked = field.value.includes(scope);
                                            const inputId = `oauth-client-edit-scope-${scope}`;
                                            return (
                                                <div
                                                    key={scope}
                                                    className="flex items-start gap-3 rounded-md border p-3"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            id={inputId}
                                                            checked={checked}
                                                            onCheckedChange={(value) => {
                                                                if (value === true) {
                                                                    field.onChange(
                                                                        field.value.includes(scope)
                                                                            ? field.value
                                                                            : [
                                                                                  ...field.value,
                                                                                  scope,
                                                                              ],
                                                                    );
                                                                    return;
                                                                }
                                                                field.onChange(
                                                                    field.value.filter(
                                                                        (entry) => entry !== scope,
                                                                    ),
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <label
                                                        htmlFor={inputId}
                                                        className="text-sm font-medium leading-none"
                                                    >
                                                        {scope}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={patchClient.isPending}
                            >
                                {t("adminDashboard.actions.cancel")}
                            </Button>
                            <Button type="submit" disabled={patchClient.isPending}>
                                {patchClient.isPending && <Spinner className="mr-2 h-4 w-4" />}
                                {t("adminDashboard.actions.save")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
