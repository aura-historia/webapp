import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { MarketingSectionHeading } from "@/components/typography/MarketingSectionHeading.tsx";
import { ArrowRight, Code2 } from "lucide-react";
import {
    ShopifyIcon,
    WooCommerceIcon,
    WordPressIcon,
} from "@/features/partner/partner-program/components/icons/BrandIcons.tsx";
import {
    SHOPIFY_APP_STORE_URL,
    WORDPRESS_PLUGIN_DIRECTORY_URL,
} from "@/features/partner/partner-program/config/partnerProgramLinks.ts";
import type { ComponentType, SVGProps } from "react";
import { Link } from "@tanstack/react-router";

type Integration = {
    readonly key: "woocommerce" | "shopify" | "customApi";
    readonly href: string;
    readonly external?: boolean;
    readonly logos: readonly ComponentType<SVGProps<SVGSVGElement>>[];
};

const INTEGRATIONS: readonly Integration[] = [
    {
        key: "woocommerce",
        href: WORDPRESS_PLUGIN_DIRECTORY_URL,
        external: true,
        // WordPress + WooCommerce – many merchants only recognize the WordPress mark.
        logos: [WordPressIcon, WooCommerceIcon],
    },
    {
        key: "shopify",
        href: SHOPIFY_APP_STORE_URL,
        external: true,
        logos: [ShopifyIcon],
    },
    {
        key: "customApi",
        href: "/$lng/partner-program/custom-integration",
        logos: [Code2],
    },
];

export default function PartnerIntegrationsSection() {
    const { t } = useTranslation();

    return (
        <section
            className="bg-background px-4 py-24 sm:px-8"
            aria-labelledby="partner-integrations-title"
        >
            <div className="mx-auto max-w-7xl">
                <MarketingSectionHeading
                    headline={t("partnerProgram.integrations.title")}
                    description={t("partnerProgram.integrations.subtitle")}
                    showDivider={false}
                />

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {INTEGRATIONS.map((integration) => (
                        <Link
                            key={integration.key}
                            to={integration.href}
                            target={integration.external ? "_blank" : undefined}
                            rel={integration.external ? "noopener noreferrer" : undefined}
                            className="group block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                            params={true}
                            from="/$lng"
                        >
                            <Card className="relative flex h-full flex-col border-2 border-border/20 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg">
                                {integration.key === "customApi" && (
                                    <span className="absolute -top-3 left-6 bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-primary-foreground">
                                        {t(`partnerProgram.integrations.${integration.key}.badge`)}
                                    </span>
                                )}
                                <CardHeader className="pt-10">
                                    <div
                                        className="flex items-center gap-3 mb-4 text-primary"
                                        aria-hidden="true"
                                    >
                                        {integration.logos.map((LogoIcon, i) => (
                                            <LogoIcon
                                                // biome-ignore lint/suspicious/noArrayIndexKey: brand icon pair is fixed
                                                key={i}
                                                className="h-9 w-9"
                                            />
                                        ))}
                                    </div>
                                    <CardTitle className="text-2xl font-display text-primary font-normal">
                                        {t(`partnerProgram.integrations.${integration.key}.title`)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col justify-between gap-6">
                                    <p className="text-muted-foreground">
                                        {t(
                                            `partnerProgram.integrations.${integration.key}.description`,
                                        )}
                                    </p>
                                    <span className="inline-flex items-center text-sm font-medium text-primary transition-colors duration-300 group-hover:text-primary-container">
                                        {t(`partnerProgram.integrations.${integration.key}.cta`)}
                                        <ArrowRight
                                            className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
