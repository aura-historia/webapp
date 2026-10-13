import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

export type PartyLocationAction = "correct" | "relocate" | "retire" | "restore";

/**
 * What an action means for public discovery, inherited listing geography and the listing-source
 * defaults that reference the site. No action ever selects another default automatically.
 */
export function PartyLocationConsequence({
    action,
    className,
}: {
    readonly action: PartyLocationAction;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    return (
        <p className={cn("text-sm text-muted-foreground", className)}>
            {t(`partyLocations.consequences.${action}`)}
        </p>
    );
}
