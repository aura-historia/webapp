import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

/**
 * Approved disclosure copy for geographic journeys:
 * - `privateAddress`: address book forms (private, asynchronous geocoding, no verification).
 * - `savedOrigin`: saving a search that contains a radius origin.
 * - `browserLocation`: next to the explicit "use my location" action.
 * - `publicPartySite`: Party location forms (active sites are public).
 */
export type GeographyDisclosureKind =
    | "privateAddress"
    | "savedOrigin"
    | "browserLocation"
    | "publicPartySite";

interface GeographyDisclosureProps {
    readonly kind: GeographyDisclosureKind;
    readonly id?: string;
    readonly className?: string;
}

export function GeographyDisclosure({ kind, id, className }: GeographyDisclosureProps) {
    const { t } = useTranslation();

    return (
        <p id={id} className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
            {t(`geography.disclosure.${kind}`)}{" "}
            <Trans
                i18nKey="geography.disclosure.privacy"
                components={{
                    privacyLink: (
                        <Link
                            to="/$lng/privacy"
                            className="underline underline-offset-2"
                            params={true}
                            from="/$lng"
                        />
                    ),
                }}
            />
        </p>
    );
}
