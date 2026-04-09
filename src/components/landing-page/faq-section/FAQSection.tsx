import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { useTranslation } from "react-i18next";
import { FAQ_DATA } from "@/components/landing-page/faq-section/FAQSection.data.ts";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

export default function FAQSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 bg-surface-container-high">
            <div className="max-w-4xl mx-auto">
                <SectionHeading
                    headline={t("landingPage.faq.title")}
                    description={t("landingPage.faq.subtitle")}
                    showDivider={true}
                />
                <Accordion type="single" collapsible className="w-full mt-12">
                    {FAQ_DATA.map((item, index) => (
                        <AccordionItem key={item.questionKey} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                                {t(item.questionKey)}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {t(item.answerKey)}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
