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
    });
}

type AdminShopCreateFormData = z.infer<ReturnType<typeof createAdminShopSchema>>;

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

    const onSubmit = (values: AdminShopCreateFormData) => {
        createShop.mutate(
            {
                name: values.name.trim(),
                shopType: values.shopType,
                domains: parseShopDomains(values.domains),
                image: values.image.trim() === "" ? null : values.image.trim(),
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.shops.create.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.shops.create.description")}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("adminDashboard.shops.fields.name")}</FormLabel>
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
                                    <FormLabel>{t("adminDashboard.shops.fields.image")}</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="url" placeholder="https://..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
