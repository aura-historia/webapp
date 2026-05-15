import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Link } from "@tanstack/react-router";

export function HiddenMatchCard() {
    const { t } = useTranslation();

    return (
        <article className="relative flex h-full min-w-0 flex-col overflow-hidden border border-outline-variant/20 bg-surface-container-lowest shadow-[0_12px_40px_rgba(28,28,22,0.06)]">
            <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
                <Lock className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <H2 className="text-[1.35rem] leading-8 italic">
                    {t("searchFilters.hiddenMatch.title")}
                </H2>
                <p className="text-sm text-muted-foreground">
                    {t("searchFilters.hiddenMatch.description")}
                </p>
                <Button
                    variant="default"
                    className="rounded-none text-[10px] uppercase tracking-[0.12em]"
                    asChild
                >
                    <Link to="/" hash="pricing">
                        {t("searchFilters.hiddenMatch.upgradeButton")}
                    </Link>
                </Button>
            </div>
        </article>
    );
}
