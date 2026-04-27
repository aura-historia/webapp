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
import type { PartnerApplication } from "@/data/internal/partner-application/PartnerApplication.ts";
import { usePatchAdminPartnerApplication } from "@/hooks/admin/useAdminPartnerApplicationActions.ts";
import { toast } from "sonner";

interface AdminApplicationEditDialogProps {
    readonly application: PartnerApplication | null;
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

export function AdminApplicationEditDialog({
    application,
    open,
    onOpenChange,
}: AdminApplicationEditDialogProps) {
    const { t } = useTranslation();
    const patch = usePatchAdminPartnerApplication();
    const [shopName, setShopName] = useState("");
    const [shopType, setShopType] = useState<ShopType>("UNKNOWN");
    const [shopImage, setShopImage] = useState("");
    const [domainsRaw, setDomainsRaw] = useState("");

    useEffect(() => {
        if (application?.payload.type === "NEW") {
            setShopName(application.payload.shopName);
            setShopType(application.payload.shopType);
            setShopImage(application.payload.shopImage ?? "");
            setDomainsRaw(application.payload.shopDomains.join("\n"));
        }
    }, [application]);

    if (!application || application.payload.type !== "NEW") {
        return null;
    }

    const handleSave = () => {
        const trimmedImage = shopImage.trim();
        patch.mutate(
            {
                partnerApplicationId: application.id,
                shopName: shopName.trim() || undefined,
                shopType: shopType !== "UNKNOWN" ? shopType : undefined,
                shopDomains: parseDomains(domainsRaw),
                shopImage: trimmedImage === "" ? null : trimmedImage,
            },
            {
                onSuccess: () => {
                    toast.success(t("adminDashboard.applications.edit.success"));
                    onOpenChange(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("adminDashboard.applications.edit.title")}</DialogTitle>
                    <DialogDescription>
                        {t("adminDashboard.applications.edit.description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-app-name">
                            {t("adminDashboard.applications.fields.shopName")}
                        </Label>
                        <Input
                            id="admin-app-name"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-app-type">
                            {t("adminDashboard.applications.fields.shopType")}
                        </Label>
                        <Select value={shopType} onValueChange={(v) => setShopType(v as ShopType)}>
                            <SelectTrigger id="admin-app-type">
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
                        <Label htmlFor="admin-app-image">
                            {t("adminDashboard.applications.fields.image")}
                        </Label>
                        <Input
                            id="admin-app-image"
                            type="url"
                            value={shopImage}
                            onChange={(e) => setShopImage(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="admin-app-domains">
                            {t("adminDashboard.applications.fields.domains")}
                        </Label>
                        <textarea
                            id="admin-app-domains"
                            className="flex min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={domainsRaw}
                            onChange={(e) => setDomainsRaw(e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">
                            {t("adminDashboard.applications.fields.domainsHint")}
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={patch.isPending}
                    >
                        {t("adminDashboard.actions.cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={patch.isPending}>
                        {patch.isPending && <Spinner className="mr-2 h-4 w-4" />}
                        {t("adminDashboard.actions.save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
