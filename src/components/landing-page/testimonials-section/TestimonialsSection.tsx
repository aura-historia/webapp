import { Card, CardContent } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/components/landing-page/testimonials-section/TestimonialsSection.data.ts";
import { SectionHeading } from "@/components/landing-page/common/SectionHeading.tsx";

export default function TestimonialsSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <SectionHeading
                    headline={t("landingPage.testimonials.title")}
                    description={t("landingPage.testimonials.subtitle")}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testimonial) => (
                        <Card
                            key={testimonial.nameKey}
                            className="relative overflow-hidden border-primary/10"
                        >
                            <CardContent className="pt-8 pb-6 flex flex-col justify-between h-full">
                                <div>
                                    <Quote className="w-10 h-10 text-primary/50 mb-4" />
                                    <p className="text-muted-foreground mb-6 italic leading-relaxed">
                                        "{t(testimonial.quoteKey)}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        {testimonial.image ? (
                                            <img
                                                src={testimonial.image}
                                                className="w-12 h-12 rounded-full object-cover"
                                                alt={""}
                                            />
                                        ) : (
                                            <span className="text-primary font-semibold text-lg">
                                                {t(testimonial.nameKey).charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold overflow">
                                            {t(testimonial.nameKey)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t(testimonial.roleKey)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
