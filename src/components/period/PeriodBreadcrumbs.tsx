import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type PeriodBreadcrumbsProps = {
    readonly periodName: string;
};

export function PeriodBreadcrumbs({ periodName }: PeriodBreadcrumbsProps) {
    const { t } = useTranslation();

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground"
        >
            <Link to="/" className="hover:text-foreground transition-colors">
                {t("period.breadcrumbs.home")}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{periodName}</span>
        </nav>
    );
}
