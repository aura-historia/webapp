import { AlertTriangle, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { useServiceStatus } from "../hooks/useServiceStatus.ts";

/**
 * Site-wide notice while the API is in maintenance or disrupted. It renders nothing during SSR
 * and until the first browser check settles, so markup stays deterministic.
 */
export function ServiceStatusBanner() {
    const { t } = useTranslation();
    const availability = useServiceStatus().result?.availability;
    const notice = availability === "operational" ? undefined : availability;
    const Icon = notice === "maintenance" ? Wrench : AlertTriangle;

    return (
        // The live region stays mounted so a notice appearing later is announced.
        <div role="status">
            {notice && (
                <div
                    className={cn(
                        "border-b px-4 py-2.5 text-sm xl:px-8",
                        notice === "maintenance"
                            ? "border-border bg-secondary-container text-on-secondary-container"
                            : "border-primary bg-primary text-primary-foreground",
                    )}
                >
                    <p className="flex items-start gap-2.5 sm:justify-center">
                        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <span>
                            <strong className="font-semibold">
                                {t(`serviceStatus.notice.${notice}.title`)}
                            </strong>{" "}
                            {t(`serviceStatus.notice.${notice}.description`)}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
