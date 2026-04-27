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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import {
    EDITABLE_SHOP_TYPES,
    parseShopDomains,
    type EditableShopType,
} from "@/components/admin/adminShopFormUtils.ts";
import { SHOP_TYPE_TRANSLATION_CONFIG } from "@/data/internal/shop/ShopType.ts";
import { useCreateAdminShop } from "@/hooks/admin/useCreateAdminShop.ts";
import { toast } from "sonner";

interface AdminShopCreateDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

const DEFAULT_VALUES = {
    name: "",
    shopType: "AUCTION_HOUSE" as EditableShopType,
    domains: "",
    image: "",
    phone: "",
    email: "",
    addressline: "",
    addresslineExtra: "",
    locality: "",
    region: "",
    postalCode: "",
    country: "",
    specialitiesCategories: "",
    specialitiesPeriods: "",
};

function createAdminShopSchema(t: (key: string) => string) {
    return z.object({
        name: z
            .string()
            .trim()
            .min(1, t("adminDashboard.shops.create.validation.nameRequired"))
            .max(255, t("adminDashboard.shops.create.validation.nameTooLong")),
        shopType: z.enum(EDITABLE_SHOP_TYPES),
        domains: z
            .string()
            .trim()
            .refine(
                (value) => parseShopDomains(value).length > 0,
                t("adminDashboard.shops.create.validation.domainsRequired"),
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
        addressline: z.string().trim(),
        addresslineExtra: z.string().trim(),
        locality: z.string().trim(),
        region: z.string().trim(),
        postalCode: z.string().trim(),
        country: z
            .string()
            .trim()
            .refine(
                (value) => value === "" || /^[A-Z]{2}$/.test(value.toUpperCase()),
                t("adminDashboard.shops.create.validation.countryInvalid"),
            ),
        specialitiesCategories: z.string().trim(),
        specialitiesPeriods: z.string().trim(),
    });
}

type AdminShopCreateFormData = z.infer<ReturnType<typeof createAdminShopSchema>>;

const parseSpecialities = (raw: string): string[] =>
    raw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

export function AdminShopCreateDialog({ open, onOpenChange }: AdminShopCreateDialogProps) {
    const { t } = useTranslation();
    const createShopSchema = useMemo(() => createAdminShopSchema(t), [t]);
    const createShop = useCreateAdminShop();

    const form = useForm<AdminShopCreateFormData>({
        resolver: zodResolver(createShopSchema),
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (open) {
            form.reset(DEFAULT_VALUES);
        }
    }, [open, form]);

    const buildStructuredAddress = (values: AdminShopCreateFormData) => {
        const trimmedAddressline = values.addressline;
        const trimmedAddresslineExtra = values.addresslineExtra;
        const trimmedLocality = values.locality;
        const trimmedRegion = values.region;
        const trimmedPostalCode = values.postalCode;
        const trimmedCountry = values.country.toUpperCase();
        const hasAnyField =
            trimmedAddressline ||
            trimmedAddresslineExtra ||
            trimmedLocality ||
            trimmedRegion ||
            trimmedPostalCode ||
            trimmedCountry;
        if (!hasAnyField) {
            return undefined;
        }
        return {
            addressline: trimmedAddressline || undefined,
            addresslineExtra: trimmedAddresslineExtra || undefined,
            locality: trimmedLocality || undefined,
            region: trimmedRegion || undefined,
            postalCode: trimmedPostalCode || undefined,
            country: trimmedCountry || undefined,
        };
    };

    const onSubmit = (values: AdminShopCreateFormData) => {
        const cats = parseSpecialities(values.specialitiesCategories);
        const periods = parseSpecialities(values.specialitiesPeriods);
        createShop.mutate(
            {
                name: values.name.trim(),
                shopType: values.shopType,
                domains: parseShopDomains(values.domains),
                image: values.image.trim() === "" ? null : values.image.trim(),
                phone: values.phone === "" ? null : values.phone,
                email: values.email === "" ? null : values.email,
                structuredAddress: buildStructuredAddress(values),
                specialitiesCategories: cats.length > 0 ? cats : undefined,
                specialitiesPeriods: periods.length > 0 ? periods : undefined,
            },
            {
                onSuccess: () => {
                    toast.success(t("adminDashboard.shops.create.success"));
                    form.reset(DEFAULT_VALUES);
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.shops.create.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.shops.create.description")}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        {/* Core fields */}
                        <section className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {t("adminDashboard.shops.sections.core")}
                            </h3>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("adminDashboard.shops.fields.name")}
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
                                name="shopType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("adminDashboard.shops.fields.shopType")}
                                        </FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EDITABLE_SHOP_TYPES.map((shopType) => (
                                                    <SelectItem key={shopType} value={shopType}>
                                                        {t(
                                                            SHOP_TYPE_TRANSLATION_CONFIG[shopType]
                                                                .translationKey,
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
                                name="domains"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("adminDashboard.shops.fields.domains")}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="min-h-[96px]" />
                                        </FormControl>
                                        <FormDescription>
                                            {t("adminDashboard.shops.fields.domainsHint")}
                                        </FormDescription>
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
                        </section>

                        {/* Contact */}
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

                        {/* Structured address */}
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
                                                {t("adminDashboard.shops.fields.addresslineExtra")}
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
                                            <FormControl>
                                                <Input {...field} placeholder="DE" maxLength={2} />
                                            </FormControl>
                                            <FormDescription>
                                                {t("adminDashboard.shops.fields.countryHint")}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>

                        {/* Specialities */}
                        <section className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                {t("adminDashboard.shops.sections.specialities")}
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="specialitiesCategories"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t(
                                                    "adminDashboard.shops.fields.specialitiesCategories",
                                                )}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="min-h-[80px]"
                                                    placeholder="ancient-egypt"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t("adminDashboard.shops.fields.specialitiesHint")}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="specialitiesPeriods"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t(
                                                    "adminDashboard.shops.fields.specialitiesPeriods",
                                                )}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="min-h-[80px]"
                                                    placeholder="roman-period"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t("adminDashboard.shops.fields.specialitiesHint")}
                                            </FormDescription>
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
                                disabled={createShop.isPending}
                            >
                                {t("adminDashboard.actions.cancel")}
                            </Button>
                            <Button type="submit" disabled={createShop.isPending}>
                                {createShop.isPending && <Spinner className="mr-2 h-4 w-4" />}
                                {t("adminDashboard.shops.create.submit")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
