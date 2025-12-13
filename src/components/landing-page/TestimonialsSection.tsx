import { H2 } from "@/components/typography/H2.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { Quote } from "lucide-react";
import testimonialImage1 from "@/assets/testimonials/testimonial1.jpg";
import testimonialImage2 from "@/assets/testimonials/testimonial2.jpg";

const testimonials = [
    {
        nameKey: "landingPage.testimonials.testimonial1.name",
        roleKey: "landingPage.testimonials.testimonial1.role",
        quoteKey: "landingPage.testimonials.testimonial1.quote",
        image: testimonialImage1,
    },
    {
        nameKey: "landingPage.testimonials.testimonial2.name",
        roleKey: "landingPage.testimonials.testimonial2.role",
        quoteKey: "landingPage.testimonials.testimonial2.quote",
        image: testimonialImage2,
    },
    {
        nameKey: "landingPage.testimonials.testimonial3.name",
        roleKey: "landingPage.testimonials.testimonial3.role",
        quoteKey: "landingPage.testimonials.testimonial3.quote",
        image: undefined,
    },
];

export default function TestimonialsSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <H2 className="mb-4">{t("landingPage.testimonials.title")}</H2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("landingPage.testimonials.subtitle")}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
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
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
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
