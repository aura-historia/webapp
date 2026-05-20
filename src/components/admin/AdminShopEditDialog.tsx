import { useEffect, useMemo } from "react";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useAdminShopMetadataOptions } from "@/components/admin/useAdminShopMetadataOptions.ts";
import {
    EDITABLE_SHOP_TYPES,
    normalizeShopDomain,
    parseShopDomains,
} from "@/components/admin/adminShopFormUtils.ts";
import type { ShopDetail, StructuredAddress } from "@/data/internal/shop/ShopDetail.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { COUNTRY_CODES } from "@/data/internal/shop/CountryCode.ts";
import { CURRENCIES } from "@/data/internal/common/Currency.ts";
import { useAdminShop } from "@/hooks/admin/useAdminShops.ts";
import { usePatchAdminShop } from "@/hooks/admin/usePatchAdminShop.ts";
import { toast } from "sonner";

const NO_COUNTRY_VALUE = "__none__";
const NO_CURRENCY_VALUE = "__none__";
const NO_LANGUAGE_VALUE = "__none__";
const EDITABLE_OR_UNKNOWN_SHOP_TYPES = ["UNKNOWN", ...EDITABLE_SHOP_TYPES] as const;
const SHOP_LANGUAGES = [
    "de",
    "en",
    "fr",
    "es",
    "it",
    "zh",
    "pt",
    "pl",
    "tr",
    "nl",
    "cs",
    "ja",
    "ru",
    "ar",
] as const;

interface AdminShopEditDialogProps {
    readonly shopId?: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

function createAdminShopEditSchema(t: (key: string) => string) {
    return z.object({
        shopType: z.enum(EDITABLE_OR_UNKNOWN_SHOP_TYPES),
        domains: z
            .string()
            .trim()
            .refine(
                (value) => parseShopDomains(value).length > 0,
                t("adminDashboard.shops.create.validation.domainsRequired"),
            ),
        url: z
            .string()
            .trim()
            .refine(
                (value) => value === "" || z.url().safeParse(value).success,
                t("adminDashboard.shops.create.validation.urlInvalid"),
            ),
        image: z
            .string()
            .trim()
            .refine(
                (value) => value === "" || z.url().safeParse(value).success,
                t("adminDashboard.shops.create.validation.imageInvalid"),
            ),
        phone: z.string().trim(),
        email: z
            .string()
            .trim()
            .refine(
                (value) => value === "" || z.email().safeParse(value).success,
                t("adminDashboard.shops.create.validation.emailInvalid"),
            ),
        shopifyDomain: z.string().trim(),
        shopifyCurrency: z.union([z.literal(""), z.enum(CURRENCIES)]),
        shopifyLanguage: z.union([z.literal(""), z.enum(SHOP_LANGUAGES)]),
        woocommerceCurrency: z.union([z.literal(""), z.enum(CURRENCIES)]),
        woocommerceLanguage: z.union([z.literal(""), z.enum(SHOP_LANGUAGES)]),
        addressline: z.string().trim(),
        addresslineExtra: z.string().trim(),
        locality: z.string().trim(),
        region: z.string().trim(),
        postalCode: z.string().trim(),
        country: z.union([z.literal(""), z.enum(COUNTRY_CODES)]),
    });
}

type AdminShopEditFormData = z.infer<ReturnType<typeof createAdminShopEditSchema>>;

const DEFAULT_VALUES: AdminShopEditFormData = {
    shopType: "UNKNOWN",
    domains: "",
    shopifyDomain: "",
    shopifyCurrency: "",
    shopifyLanguage: "",
    woocommerceCurrency: "",
    woocommerceLanguage: "",
    url: "",
    image: "",
    phone: "",
    email: "",
    addressline: "",
    addresslineExtra: "",
    locality: "",
    region: "",
    postalCode: "",
    country: "",
};

function mapShopToFormValues(shop: ShopDetail): AdminShopEditFormData {
    return {
        shopType: shop.shopType,
        domains: shop.domains.join("\n"),
        shopifyDomain: shop.shopifyDomain ?? "",
        shopifyCurrency: shop.shopifyCurrency ?? "",
        shopifyLanguage: shop.shopifyLanguage ?? "",
        woocommerceCurrency: shop.woocommerceCurrency ?? "",
        woocommerceLanguage: shop.woocommerceLanguage ?? "",
        url: shop.url ?? "",
        image: shop.image ?? "",
        phone: shop.phone ?? "",
        email: shop.email ?? "",
        addressline: shop.structuredAddress?.addressline ?? "",
        addresslineExtra: shop.structuredAddress?.addresslineExtra ?? "",
        locality: shop.structuredAddress?.locality ?? "",
        region: shop.structuredAddress?.region ?? "",
        postalCode: shop.structuredAddress?.postalCode ?? "",
        country: shop.structuredAddress?.country ?? "",
    };
}

function buildStructuredAddress(values: AdminShopEditFormData): StructuredAddress | null {
    const hasAnyField =
        values.addressline ||
        values.addresslineExtra ||
        values.locality ||
        values.region ||
        values.postalCode ||
        values.country;

    if (!hasAnyField) {
        return null;
    }

    return {
        addressline: values.addressline || undefined,
        addresslineExtra: values.addresslineExtra || undefined,
        locality: values.locality || undefined,
        region: values.region || undefined,
        postalCode: values.postalCode || undefined,
        country: values.country || undefined,
    };
}

export function AdminShopEditDialog({ shopId, open, onOpenChange }: AdminShopEditDialogProps) {
    const { t } = useTranslation();
    const patchShop = usePatchAdminShop();
    const editShopSchema = useMemo(() => createAdminShopEditSchema(t), [t]);
    const { countryOptions, currencyOptions, languageOptions } = useAdminShopMetadataOptions();
    const {
        data: loadedShop,
        isPending: isShopPending,
        isError: isShopError,
        refetch: refetchShop,
    } = useAdminShop(shopId, open);

    const form = useForm<AdminShopEditFormData>({
        resolver: zodResolver(editShopSchema),
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (open && loadedShop) {
            form.reset(mapShopToFormValues(loadedShop));
        }
    }, [open, loadedShop, form]);

    if (!shopId) {
        return null;
    }

    const onSubmit = (values: AdminShopEditFormData) => {
        patchShop.mutate(
            {
                shopId,
                shopType: values.shopType === "UNKNOWN" ? undefined : values.shopType,
                domains: parseShopDomains(values.domains),
                shopifyDomain:
                    normalizeShopDomain(values.shopifyDomain) === ""
                        ? null
                        : normalizeShopDomain(values.shopifyDomain),
                shopifyCurrency: values.shopifyCurrency === "" ? null : values.shopifyCurrency,
                shopifyLanguage: values.shopifyLanguage === "" ? null : values.shopifyLanguage,
                woocommerceCurrency:
                    values.woocommerceCurrency === "" ? null : values.woocommerceCurrency,
                woocommerceLanguage:
                    values.woocommerceLanguage === "" ? null : values.woocommerceLanguage,
                url: values.url === "" ? null : values.url,
                image: values.image === "" ? null : values.image,
                phone: values.phone === "" ? null : values.phone,
                email: values.email === "" ? null : values.email,
                structuredAddress: buildStructuredAddress(values),
            },
            {
                onSuccess: () => {
                    toast.success(t("adminDashboard.shops.edit.success"));
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:w-[min(calc(100vw-4rem),88rem)] sm:max-w-[min(calc(100vw-4rem),88rem)]">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.shops.edit.title")}</DialogTitle>
                    {loadedShop && (
                        <DialogDescription>
                            {t("adminDashboard.shops.edit.description", {
                                shop: loadedShop.name,
                            })}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {isShopPending ? (
                    <div className="flex justify-center py-10" role="status" aria-live="polite">
                        <Spinner />
                    </div>
                ) : isShopError || !loadedShop ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            {t("adminDashboard.shops.loadError")}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => refetchShop()}>
                            {t("adminDashboard.actions.retry")}
                        </Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-6"
                        >
                            <section className="flex flex-col gap-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t("adminDashboard.shops.sections.core")}
                                </h3>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="shopType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.shopType")}
                                                </FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {EDITABLE_SHOP_TYPES.map((shopType) => (
                                                            <SelectItem
                                                                key={shopType}
                                                                value={shopType}
                                                            >
                                                                {t(
                                                                    SHOP_TYPE_TRANSLATION_CONFIG[
                                                                        shopType
                                                                    ].translationKey,
                                                                )}
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
                                        name="url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.url")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="url"
                                                        placeholder="https://shop.example.com"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.image")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="url"
                                                        placeholder="https://..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="domains"
                                        render={({ field }) => (
                                            <FormItem className="lg:col-span-2">
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.domains")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} className="min-h-[96px]" />
                                                </FormControl>
                                                <span className="text-xs text-muted-foreground">
                                                    {t("adminDashboard.shops.fields.domainsHint")}
                                                </span>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid gap-4 rounded-lg border border-border/60 bg-muted/20 p-4 lg:col-span-2 lg:grid-cols-2">
                                        <h4 className="lg:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t("adminDashboard.shops.sections.shopify")}
                                        </h4>
                                        <FormField
                                            control={form.control}
                                            name="shopifyDomain"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            "adminDashboard.shops.fields.shopifyDomain",
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="shop-name.myshopify.com"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="shopifyCurrency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            "adminDashboard.shops.fields.shopifyCurrency",
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        value={field.value || NO_CURRENCY_VALUE}
                                                        onValueChange={(value) =>
                                                            field.onChange(
                                                                value === NO_CURRENCY_VALUE
                                                                    ? ""
                                                                    : value,
                                                            )
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        "adminDashboard.shops.fields.currencyPlaceholder",
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={NO_CURRENCY_VALUE}>
                                                                {t(
                                                                    "adminDashboard.shops.fields.currencyNone",
                                                                )}
                                                            </SelectItem>
                                                            {currencyOptions.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
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
                                            name="shopifyLanguage"
                                            render={({ field }) => (
                                                <FormItem className="lg:col-span-2">
                                                    <FormLabel>
                                                        {t(
                                                            "adminDashboard.shops.fields.shopifyLanguage",
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        value={field.value || NO_LANGUAGE_VALUE}
                                                        onValueChange={(value) =>
                                                            field.onChange(
                                                                value === NO_LANGUAGE_VALUE
                                                                    ? ""
                                                                    : value,
                                                            )
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        "adminDashboard.shops.fields.languagePlaceholder",
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={NO_LANGUAGE_VALUE}>
                                                                {t(
                                                                    "adminDashboard.shops.fields.languageNone",
                                                                )}
                                                            </SelectItem>
                                                            {languageOptions.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-4 rounded-lg border border-border/60 bg-muted/20 p-4 lg:col-span-2 lg:grid-cols-2">
                                        <h4 className="lg:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {t("adminDashboard.shops.sections.woocommerce")}
                                        </h4>
                                        <FormField
                                            control={form.control}
                                            name="woocommerceCurrency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            "adminDashboard.shops.fields.woocommerceCurrency",
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        value={field.value || NO_CURRENCY_VALUE}
                                                        onValueChange={(value) =>
                                                            field.onChange(
                                                                value === NO_CURRENCY_VALUE
                                                                    ? ""
                                                                    : value,
                                                            )
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        "adminDashboard.shops.fields.currencyPlaceholder",
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={NO_CURRENCY_VALUE}>
                                                                {t(
                                                                    "adminDashboard.shops.fields.currencyNone",
                                                                )}
                                                            </SelectItem>
                                                            {currencyOptions.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
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
                                            name="woocommerceLanguage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            "adminDashboard.shops.fields.woocommerceLanguage",
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        value={field.value || NO_LANGUAGE_VALUE}
                                                        onValueChange={(value) =>
                                                            field.onChange(
                                                                value === NO_LANGUAGE_VALUE
                                                                    ? ""
                                                                    : value,
                                                            )
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        "adminDashboard.shops.fields.languagePlaceholder",
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={NO_LANGUAGE_VALUE}>
                                                                {t(
                                                                    "adminDashboard.shops.fields.languageNone",
                                                                )}
                                                            </SelectItem>
                                                            {languageOptions.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="flex flex-col gap-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t("adminDashboard.shops.sections.contact")}
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.phone")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="tel"
                                                        placeholder="+49 30 123456"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.email")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder="contact@example.com"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            <section className="flex flex-col gap-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t("adminDashboard.shops.sections.address")}
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="addressline"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.addressline")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Hauptstraße 1" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="addresslineExtra"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t(
                                                        "adminDashboard.shops.fields.addresslineExtra",
                                                    )}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Etage 3" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="locality"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.locality")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Berlin" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="region"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.region")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Brandenburg" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="postalCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.postalCode")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="10115" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("adminDashboard.shops.fields.country")}
                                                </FormLabel>
                                                <Select
                                                    value={field.value || NO_COUNTRY_VALUE}
                                                    onValueChange={(value) =>
                                                        field.onChange(
                                                            value === NO_COUNTRY_VALUE ? "" : value,
                                                        )
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue
                                                                placeholder={t(
                                                                    "adminDashboard.shops.fields.countryPlaceholder",
                                                                )}
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={NO_COUNTRY_VALUE}>
                                                            {t(
                                                                "adminDashboard.shops.fields.countryNone",
                                                            )}
                                                        </SelectItem>
                                                        {countryOptions.map((option) => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-xs text-muted-foreground">
                                                    {t("adminDashboard.shops.fields.countryHint")}
                                                </span>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </section>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={patchShop.isPending}
                                >
                                    {t("adminDashboard.actions.cancel")}
                                </Button>
                                <Button type="submit" disabled={patchShop.isPending}>
                                    {patchShop.isPending && <Spinner className="mr-2 h-4 w-4" />}
                                    {t("adminDashboard.actions.save")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
