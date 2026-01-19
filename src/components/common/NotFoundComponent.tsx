import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { H2 } from "@/components/typography/H2.tsx";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";

export function NotFoundComponent() {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <SearchX className="h-16 w-16 text-muted-foreground" />
                <div className="text-center space-y-2">
                    <H2>{t("notFound.title")}</H2>
                    <p className="text-base text-muted-foreground">{t("notFound.description")}</p>
                </div>
                <Button asChild>
                    <Link to="/">{t("notFound.goHome")}</Link>
                </Button>
            </div>
        </div>
    );
}
