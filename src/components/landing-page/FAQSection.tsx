import { H2 } from "@/components/typography/H2.tsx";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { useTranslation } from "react-i18next";

const faqItems = [
    {
        questionKey: "landingPage.faq.items.free.question",
        answerKey: "landingPage.faq.items.free.answer",
    },
    {
        questionKey: "landingPage.faq.items.howItWorks.question",
        answerKey: "landingPage.faq.items.howItWorks.answer",
    },
    {
        questionKey: "landingPage.faq.items.directPurchase.question",
        answerKey: "landingPage.faq.items.directPurchase.answer",
    },
    {
        questionKey: "landingPage.faq.items.priceAlerts.question",
        answerKey: "landingPage.faq.items.priceAlerts.answer",
    },
    {
        questionKey: "landingPage.faq.items.updateFrequency.question",
        answerKey: "landingPage.faq.items.updateFrequency.answer",
    },
    {
        questionKey: "landingPage.faq.items.dealers.question",
        answerKey: "landingPage.faq.items.dealers.answer",
    },
];

export default function FAQSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <H2 className="mb-4">{t("landingPage.faq.title")}</H2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("landingPage.faq.subtitle")}
                    </p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
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
