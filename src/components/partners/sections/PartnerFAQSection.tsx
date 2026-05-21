import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

const FAQ_KEYS = [
    "free",
    "cancel",
    "technical",
    "exclusivity",
    "data",
    "transactions",
    "fit",
    "support",
] as const;

export default function PartnerFAQSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 bg-surface-container-high">
            <div className="max-w-4xl mx-auto">
                <SectionHeading
                    headline={t("partners.faq.title")}
                    description={t("partners.faq.subtitle")}
                    showDivider={true}
                />
                <Accordion type="single" collapsible className="w-full mt-12">
                    {FAQ_KEYS.map((itemKey, index) => (
                        <AccordionItem key={itemKey} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                                {t(`partners.faq.items.${itemKey}.question`)}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {t(`partners.faq.items.${itemKey}.answer`)}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
