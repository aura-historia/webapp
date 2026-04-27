import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { SHOP_TYPE_TRANSLATION_CONFIG, type ShopType } from "@/data/internal/shop/ShopType.ts";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { usePatchAdminShop } from "@/hooks/admin/usePatchAdminShop.ts";
import { EDITABLE_SHOP_TYPES, parseShopDomains } from "@/components/admin/adminShopFormUtils.ts";
import { toast } from "sonner";

interface AdminShopEditDialogProps {
    readonly shop: ShopDetail | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function AdminShopEditDialog({ shop, open, onOpenChange }: AdminShopEditDialogProps) {
    const { t } = useTranslation();
    const patchShop = usePatchAdminShop();
    const [shopType, setShopType] = useState<ShopType>("UNKNOWN");
    const [image, setImage] = useState<string>("");
    const [domainsRaw, setDomainsRaw] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [addressline, setAddressline] = useState<string>("");
    const [addresslineExtra, setAddresslineExtra] = useState<string>("");
    const [locality, setLocality] = useState<string>("");
    const [region, setRegion] = useState<string>("");
    const [postalCode, setPostalCode] = useState<string>("");
    const [country, setCountry] = useState<string>("");
    const [specialitiesCategories, setSpecialitiesCategories] = useState<string>("");
    const [specialitiesPeriods, setSpecialitiesPeriods] = useState<string>("");

    useEffect(() => {
        if (shop) {
            setShopType(shop.shopType);
            setImage(shop.image ?? "");
            setDomainsRaw(shop.domains.join("\n"));
            setPhone(shop.phone ?? "");
            setEmail(shop.email ?? "");
            setAddressline(shop.structuredAddress?.addressline ?? "");
            setAddresslineExtra(shop.structuredAddress?.addresslineExtra ?? "");
            setLocality(shop.structuredAddress?.locality ?? "");
            setRegion(shop.structuredAddress?.region ?? "");
            setPostalCode(shop.structuredAddress?.postalCode ?? "");
            setCountry(shop.structuredAddress?.country ?? "");
            setSpecialitiesCategories(shop.specialitiesCategories?.join("\n") ?? "");
            setSpecialitiesPeriods(shop.specialitiesPeriods?.join("\n") ?? "");
        }
    }, [shop]);

    if (!shop) {
        return null;
    }

    const buildStructuredAddress = () => {
        const trimmedAddressline = addressline.trim();
        const trimmedAddresslineExtra = addresslineExtra.trim();
        const trimmedLocality = locality.trim();
        const trimmedRegion = region.trim();
        const trimmedPostalCode = postalCode.trim();
        const trimmedCountry = country.trim();
        const hasAnyField =
            trimmedAddressline ||
            trimmedAddresslineExtra ||
            trimmedLocality ||
            trimmedRegion ||
            trimmedPostalCode ||
            trimmedCountry;
        if (!hasAnyField) {
            return null;
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

    const parseSpecialities = (raw: string): string[] =>
        raw
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

    const handleSave = () => {
        const trimmedImage = image.trim();
        const trimmedPhone = phone.trim();
        const trimmedEmail = email.trim();
        const cats = parseSpecialities(specialitiesCategories);
        const periods = parseSpecialities(specialitiesPeriods);

        patchShop.mutate(
            {
                shopId: shop.shopId,
                shopType: shopType !== "UNKNOWN" ? shopType : undefined,
                domains: parseShopDomains(domainsRaw),
                image: trimmedImage === "" ? null : trimmedImage,
                phone: trimmedPhone === "" ? null : trimmedPhone,
                email: trimmedEmail === "" ? null : trimmedEmail,
                structuredAddress: buildStructuredAddress(),
                specialitiesCategories: cats.length > 0 ? cats : null,
                specialitiesPeriods: periods.length > 0 ? periods : null,
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
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.shops.edit.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.shops.edit.description", { shop: shop.name })}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    <section className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("adminDashboard.shops.sections.core")}
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="admin-shop-type">
                                {t("adminDashboard.shops.fields.shopType")}
                            </Label>
                            <Select
                                value={shopType}
                                onValueChange={(v) => setShopType(v as ShopType)}
                            >
                                <SelectTrigger id="admin-shop-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {EDITABLE_SHOP_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {t(SHOP_TYPE_TRANSLATION_CONFIG[type].translationKey)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="admin-shop-image">
                                {t("adminDashboard.shops.fields.image")}
                            </Label>
                            <Input
                                id="admin-shop-image"
                                type="url"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="admin-shop-domains">
                                {t("adminDashboard.shops.fields.domains")}
                            </Label>
                            <textarea
                                id="admin-shop-domains"
                                className="flex min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={domainsRaw}
                                onChange={(e) => setDomainsRaw(e.target.value)}
                                placeholder="example.com"
                            />
                            <span className="text-xs text-muted-foreground">
                                {t("adminDashboard.shops.fields.domainsHint")}
                            </span>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("adminDashboard.shops.sections.contact")}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-phone">
                                    {t("adminDashboard.shops.fields.phone")}
                                </Label>
                                <Input
                                    id="admin-shop-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+49 30 123456"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-email">
                                    {t("adminDashboard.shops.fields.email")}
                                </Label>
                                <Input
                                    id="admin-shop-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="contact@example.com"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("adminDashboard.shops.sections.address")}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-addressline">
                                    {t("adminDashboard.shops.fields.addressline")}
                                </Label>
                                <Input
                                    id="admin-shop-addressline"
                                    value={addressline}
                                    onChange={(e) => setAddressline(e.target.value)}
                                    placeholder="Hauptstraße 1"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-addressline-extra">
                                    {t("adminDashboard.shops.fields.addresslineExtra")}
                                </Label>
                                <Input
                                    id="admin-shop-addressline-extra"
                                    value={addresslineExtra}
                                    onChange={(e) => setAddresslineExtra(e.target.value)}
                                    placeholder="Etage 3"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-locality">
                                    {t("adminDashboard.shops.fields.locality")}
                                </Label>
                                <Input
                                    id="admin-shop-locality"
                                    value={locality}
                                    onChange={(e) => setLocality(e.target.value)}
                                    placeholder="Berlin"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-region">
                                    {t("adminDashboard.shops.fields.region")}
                                </Label>
                                <Input
                                    id="admin-shop-region"
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    placeholder="Brandenburg"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-postal-code">
                                    {t("adminDashboard.shops.fields.postalCode")}
                                </Label>
                                <Input
                                    id="admin-shop-postal-code"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    placeholder="10115"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-country">
                                    {t("adminDashboard.shops.fields.country")}
                                </Label>
                                <Input
                                    id="admin-shop-country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="DE"
                                    maxLength={2}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {t("adminDashboard.shops.fields.countryHint")}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            {t("adminDashboard.shops.sections.specialities")}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-specialities-categories">
                                    {t("adminDashboard.shops.fields.specialitiesCategories")}
                                </Label>
                                <textarea
                                    id="admin-shop-specialities-categories"
                                    className="flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={specialitiesCategories}
                                    onChange={(e) => setSpecialitiesCategories(e.target.value)}
                                    placeholder="ancient-egypt"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {t("adminDashboard.shops.fields.specialitiesHint")}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="admin-shop-specialities-periods">
                                    {t("adminDashboard.shops.fields.specialitiesPeriods")}
                                </Label>
                                <textarea
                                    id="admin-shop-specialities-periods"
                                    className="flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={specialitiesPeriods}
                                    onChange={(e) => setSpecialitiesPeriods(e.target.value)}
                                    placeholder="roman-period"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {t("adminDashboard.shops.fields.specialitiesHint")}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={patchShop.isPending}
                    >
                        {t("adminDashboard.actions.cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={patchShop.isPending}>
                        {patchShop.isPending && <Spinner className="mr-2 h-4 w-4" />}
                        {t("adminDashboard.actions.save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
