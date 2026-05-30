import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Copy } from "lucide-react";
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
import { useCreateOAuthClient } from "@/hooks/admin/useAdminOAuthClientActions.ts";
import { toast } from "sonner";

const OAUTH_SCOPES = [
    "shops:manage",
    "products:write",
] as const satisfies readonly AccessTokenScopeData[];

interface AdminOAuthClientCreateDialogProps {
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
            .min(1, t("adminDashboard.oauthClients.create.validation.nameRequired"))
            .max(255, t("adminDashboard.oauthClients.create.validation.nameTooLong")),
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

type AdminOAuthClientCreateFormData = z.infer<ReturnType<typeof createOAuthClientSchema>>;

const DEFAULT_VALUES: AdminOAuthClientCreateFormData = {
    clientName: "",
    redirectUris: "",
    scope: [],
};

async function copyValue(value: string) {
    if (typeof navigator === "undefined" || navigator.clipboard === undefined) {
        return;
    }
    await navigator.clipboard.writeText(value);
}

export function AdminOAuthClientCreateDialog({
    open,
    onOpenChange,
}: AdminOAuthClientCreateDialogProps) {
    const { t } = useTranslation();
    const schema = useMemo(() => createOAuthClientSchema(t), [t]);
    const createClient = useCreateOAuthClient();
    const [createdClient, setCreatedClient] = useState<OAuthClient | null>(null);

    const form = useForm<AdminOAuthClientCreateFormData>({
        resolver: zodResolver(schema),
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        setCreatedClient(null);
        form.reset(DEFAULT_VALUES);
    }, [form, open]);

    const onSubmit = (values: AdminOAuthClientCreateFormData) => {
        createClient.mutate(
            {
                clientName: values.clientName.trim(),
                redirectUris: parseRedirectUris(values.redirectUris),
                scope: values.scope,
            },
            {
                onSuccess: (client) => {
                    toast.success(t("adminDashboard.oauthClients.create.success"));
                    setCreatedClient(client);
                    form.reset(DEFAULT_VALUES);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.oauthClients.create.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.oauthClients.create.description")}
                    </DialogDescription>
                </DialogHeader>

                {createdClient ? (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground">
                            {t("adminDashboard.oauthClients.create.secretNotice")}
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <FormLabel>{t("adminDashboard.oauthClients.clientId")}</FormLabel>
                            <div className="flex gap-2">
                                <Input
                                    value={createdClient.clientId}
                                    readOnly
                                    className="font-mono"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => void copyValue(createdClient.clientId)}
                                    aria-label={t("share.copyLink")}
                                >
                                    <Copy className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <FormLabel>{t("adminDashboard.oauthClients.clientSecret")}</FormLabel>
                            <div className="flex gap-2">
                                <Input
                                    value={createdClient.clientSecret}
                                    readOnly
                                    className="font-mono"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => void copyValue(createdClient.clientSecret)}
                                    aria-label={t("share.copyLink")}
                                >
                                    <Copy className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" onClick={() => onOpenChange(false)}>
                                {t("adminDashboard.actions.cancel")}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-4"
                        >
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
                                            {t(
                                                "adminDashboard.oauthClients.fields.redirectUrisHint",
                                            )}
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
                                                const inputId = `oauth-client-create-scope-${scope}`;
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
                                                                            field.value.includes(
                                                                                scope,
                                                                            )
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
                                                                            (entry) =>
                                                                                entry !== scope,
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
                                    disabled={createClient.isPending}
                                >
                                    {t("adminDashboard.actions.cancel")}
                                </Button>
                                <Button type="submit" disabled={createClient.isPending}>
                                    {createClient.isPending && <Spinner className="mr-2 h-4 w-4" />}
                                    {t("adminDashboard.oauthClients.create.submit")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
