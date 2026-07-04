import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import type { AccessTokenScopeData } from "@/client";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

export const OAUTH_SCOPES = [
    "shops:manage",
    "products:write",
] as const satisfies readonly AccessTokenScopeData[];

export type OAuthClientFormValues = {
    clientName: string;
    tosUri: string;
    policyUri: string;
    clientUri: string;
    logoUri: string;
    redirectUris: string;
    scope: AccessTokenScopeData[];
};

export const EMPTY_OAUTH_CLIENT_FORM_VALUES: OAuthClientFormValues = {
    clientName: "",
    tosUri: "",
    policyUri: "",
    clientUri: "",
    logoUri: "",
    redirectUris: "",
    scope: [],
};

interface OAuthClientFormFieldsProps {
    readonly scopeInputIdPrefix: string;
}

export function OAuthClientFormFields({ scopeInputIdPrefix }: OAuthClientFormFieldsProps) {
    const { t } = useTranslation();
    const form = useFormContext<OAuthClientFormValues>();

    return (
        <>
            <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t("adminDashboard.oauthClients.fields.clientName")}</FormLabel>
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
                        <FormLabel>{t("adminDashboard.oauthClients.fields.clientUri")}</FormLabel>
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
                        <FormLabel>{t("adminDashboard.oauthClients.fields.logoUri")}</FormLabel>
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
                            <FormLabel>{t("adminDashboard.oauthClients.fields.tosUri")}</FormLabel>
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
                    <OAuthClientScopeField
                        inputIdPrefix={scopeInputIdPrefix}
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />
        </>
    );
}

interface OAuthClientScopeFieldProps {
    readonly inputIdPrefix: string;
    readonly value: AccessTokenScopeData[];
    readonly onChange: (value: AccessTokenScopeData[]) => void;
}

function OAuthClientScopeField({ inputIdPrefix, value, onChange }: OAuthClientScopeFieldProps) {
    const { t } = useTranslation();

    return (
        <FormItem>
            <FormLabel>{t("adminDashboard.oauthClients.fields.scope")}</FormLabel>
            <FormDescription>{t("adminDashboard.oauthClients.fields.scopeHint")}</FormDescription>
            <div className="grid gap-2 pt-1">
                {OAUTH_SCOPES.map((scope) => (
                    <OAuthClientScopeOption
                        key={scope}
                        inputId={`${inputIdPrefix}-${scope}`}
                        scope={scope}
                        selectedScopes={value}
                        onChange={onChange}
                    />
                ))}
            </div>
            <FormMessage />
        </FormItem>
    );
}

interface OAuthClientScopeOptionProps {
    readonly inputId: string;
    readonly scope: AccessTokenScopeData;
    readonly selectedScopes: AccessTokenScopeData[];
    readonly onChange: (value: AccessTokenScopeData[]) => void;
}

function OAuthClientScopeOption({
    inputId,
    scope,
    selectedScopes,
    onChange,
}: OAuthClientScopeOptionProps) {
    const checked = selectedScopes.includes(scope);

    const handleCheckedChange = (isChecked: boolean | "indeterminate") => {
        const nextScopes = isChecked
            ? [...new Set([...selectedScopes, scope])]
            : selectedScopes.filter((entry) => entry !== scope);
        onChange(nextScopes);
    };

    return (
        <div className="flex items-start gap-3 rounded-md border p-3">
            <FormControl>
                <Checkbox id={inputId} checked={checked} onCheckedChange={handleCheckedChange} />
            </FormControl>
            <label htmlFor={inputId} className="text-sm font-medium leading-none">
                {scope}
            </label>
        </div>
    );
}
