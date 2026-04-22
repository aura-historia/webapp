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
import {
    SHOP_TYPES,
    SHOP_TYPE_TRANSLATION_CONFIG,
    type ShopType,
} from "@/data/internal/shop/ShopType.ts";
import type { ShopDetail } from "@/data/internal/shop/ShopDetail.ts";
import { usePatchAdminShop } from "@/hooks/admin/usePatchAdminShop.ts";
import { toast } from "sonner";

interface AdminShopEditDialogProps {
    readonly shop: ShopDetail | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

const EDITABLE_SHOP_TYPES = SHOP_TYPES.filter((t) => t !== "UNKNOWN");

function parseDomains(input: string): string[] {
    return input
        .split(/[\s,;\n]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);
}

export function AdminShopEditDialog({ shop, open, onOpenChange }: AdminShopEditDialogProps) {
    const { t } = useTranslation();
    const patchShop = usePatchAdminShop();
    const [shopType, setShopType] = useState<ShopType>("UNKNOWN");
    const [image, setImage] = useState<string>("");
    const [domainsRaw, setDomainsRaw] = useState<string>("");

    useEffect(() => {
        if (shop) {
            setShopType(shop.shopType);
            setImage(shop.image ?? "");
            setDomainsRaw(shop.domains.join("\n"));
        }
    }, [shop]);

    if (!shop) {
        return null;
    }

    const handleSave = () => {
        const trimmedImage = image.trim();
        patchShop.mutate(
            {
                shopId: shop.shopId,
                shopType: shopType !== "UNKNOWN" ? shopType : undefined,
                domains: parseDomains(domainsRaw),
                image: trimmedImage === "" ? null : trimmedImage,
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.shops.edit.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.shops.edit.description", { shop: shop.name })}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-shop-type">
                            {t("adminDashboard.shops.fields.shopType")}
                        </Label>
                        <Select value={shopType} onValueChange={(v) => setShopType(v as ShopType)}>
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
