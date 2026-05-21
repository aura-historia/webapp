import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";
import { ArrowRight, Code2 } from "lucide-react";
import {
    ShopifyIcon,
    WooCommerceIcon,
    WordPressIcon,
} from "@/components/partners/icons/BrandIcons.tsx";
import type { ComponentType, SVGProps } from "react";

type Integration = {
    readonly key: "woocommerce" | "shopify" | "customApi";
    readonly href: string;
    readonly logos: readonly ComponentType<SVGProps<SVGSVGElement>>[];
};

const INTEGRATIONS: readonly Integration[] = [
    {
        key: "woocommerce",
        href: "/partners/woocommerce",
        // WordPress + WooCommerce – many merchants only recognize the WordPress mark.
        logos: [WordPressIcon, WooCommerceIcon],
    },
    {
        key: "shopify",
        href: "/partners/shopify",
        logos: [ShopifyIcon],
    },
    {
        key: "customApi",
        href: "/partners/custom-api",
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
                <SectionHeading
                    headline={t("partners.integrations.title")}
                    description={t("partners.integrations.subtitle")}
                    showDivider={false}
                />

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {INTEGRATIONS.map((integration) => (
                        <a
                            key={integration.key}
                            href={integration.href}
                            className="group block focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <Card className="relative flex h-full flex-col border-2 border-border/20 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg">
                                <span className="absolute -top-3 left-6 bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-primary-foreground">
                                    {t(`partners.integrations.${integration.key}.badge`)}
                                </span>
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
                                        {t(`partners.integrations.${integration.key}.title`)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-1 flex-col justify-between gap-6">
                                    <p className="text-muted-foreground">
                                        {t(`partners.integrations.${integration.key}.description`)}
                                    </p>
                                    <span className="inline-flex items-center text-sm font-medium text-primary transition-colors duration-300 group-hover:text-primary-container">
                                        {t(`partners.integrations.${integration.key}.cta`)}
                                        <ArrowRight
                                            className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </CardContent>
                            </Card>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
