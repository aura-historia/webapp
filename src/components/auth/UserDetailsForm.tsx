import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { LANGUAGES } from "@/data/internal/common/Language.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { setPendingUserData, setUserAuthenticated } from "@/stores/registrationStore";
import { getAccountEditSchema, type AccountEditFormData } from "@/utils/nameValidation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type UserDetailsFormProps = {
    onSuccess: () => void;
};

export function UserDetailsForm({ onSuccess }: UserDetailsFormProps) {
    const { t } = useTranslation();
    const schema = getAccountEditSchema(t);

    const form = useForm<AccountEditFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            language: undefined,
            currency: undefined,
            prohibitedContentConsent: false,
        },
    });

    const onSubmit = async (data: AccountEditFormData) => {
        try {
            setPendingUserData({
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                language: data.language || undefined,
                currency: data.currency || undefined,
                prohibitedContentConsent: data.prohibitedContentConsent,
            });
            setUserAuthenticated();
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : t("apiErrors.unknown");
            form.setError("root", { message });
        }
    };

    const handleSkip = () => {
        setUserAuthenticated();
        onSuccess();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl text-primary">
                    {t("auth.userDetails.title")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("auth.userDetails.subtitle")}</p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                    noValidate
                >
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.firstName")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            autoComplete="given-name"
                                            placeholder={t("auth.signUp.firstNamePlaceholder")}
                                            className="h-11 bg-transparent"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.lastName")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            autoComplete="family-name"
                                            placeholder={t("auth.signUp.lastNamePlaceholder")}
                                            className="h-11 bg-transparent"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.language")}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        key={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full data-[size=default]:h-11">
                                                <SelectValue
                                                    placeholder={t("auth.signUp.pleaseSelect")}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {LANGUAGES.map((lang) => (
                                                <SelectItem key={lang} value={lang}>
                                                    {t(`auth.languages.${lang}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("auth.signUp.currency")}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        key={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full data-[size=default]:h-11">
                                                <SelectValue
                                                    placeholder={t("auth.signUp.pleaseSelect")}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CURRENCIES.map((curr) => (
                                                <SelectItem key={curr} value={curr}>
                                                    {t(`auth.currencies.${curr}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="prohibitedContentConsent"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="mt-1"
                                        />
                                    </FormControl>
                                    <FormLabel className="inline-flex cursor-pointer items-center gap-1.5 font-medium leading-snug">
                                        {t("auth.signUp.prohibitedContentConsentLabel")}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info
                                                        size={14}
                                                        className="shrink-0 cursor-help text-muted-foreground"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p>
                                                        {t(
                                                            "auth.signUp.prohibitedContentConsentTooltip",
                                                        )}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.formState.errors.root && (
                        <p className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {form.formState.errors.root.message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="mt-2 w-full"
                    >
                        {form.formState.isSubmitting && <Spinner />}
                        {t("auth.userDetails.submit")}
                    </Button>

                    <Button
                        type="button"
                        variant="link"
                        onClick={handleSkip}
                        className="h-auto p-0 text-sm text-muted-foreground"
                    >
                        {t("auth.userDetails.skip")}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
