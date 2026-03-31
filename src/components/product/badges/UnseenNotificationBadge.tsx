import { Badge } from "@/components/ui/badge.tsx";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export function UnseenNotificationBadge() {
    const { t } = useTranslation();

    return (
        <Badge
            data-testid="unseen-notification-badge"
            className="bg-primary text-primary-foreground py-1 gap-1"
        >
            <Info className="w-3 h-3" />
            {t("product.unseenNotification")}
        </Badge>
    );
}
