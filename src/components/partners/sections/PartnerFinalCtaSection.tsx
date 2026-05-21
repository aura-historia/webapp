import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { ArrowRight, Mail } from "lucide-react";
import { H2 } from "@/components/typography/H2.tsx";

export default function PartnerFinalCtaSection() {
    const { t } = useTranslation();

    return (
        <section
            className="relative overflow-hidden bg-linear-to-br from-primary to-primary-container px-4 py-24 sm:px-8 text-primary-foreground"
            aria-labelledby="partner-final-cta-title"
        >
            <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-8">
                <H2
                    id="partner-final-cta-title"
                    className="text-3xl sm:text-5xl font-normal text-primary-foreground"
                >
                    {t("partners.finalCta.title")}
                </H2>
                <p className="max-w-2xl text-base sm:text-lg text-primary-foreground/85">
                    {t("partners.finalCta.subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
                    <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="min-h-12 bg-tertiary text-on-tertiary hover:bg-tertiary/90"
                    >
                        <a href="/partners/apply">
                            {t("partners.finalCta.primary")}
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </a>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="min-h-12 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                        <a href="mailto:partners@aura-historia.com">
                            <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t("partners.finalCta.secondary")}
                        </a>
                    </Button>
                </div>
            </div>
        </section>
    );
}
