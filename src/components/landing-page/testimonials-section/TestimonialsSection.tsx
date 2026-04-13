import { Card, CardContent } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/components/landing-page/testimonials-section/TestimonialsSection.data.ts";
import { H2 } from "@/components/typography/H2.tsx";

export default function TestimonialsSection() {
    const { t } = useTranslation();

    return (
        <section
            className="bg-background px-4 py-24 sm:px-8"
            aria-label={t("landingPage.testimonials.title")}
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-16">
                <div className="flex flex-col items-center gap-4 text-center">
                    <H2 className="font-display text-4xl italic font-normal sm:text-5xl">
                        {t("landingPage.testimonials.title")}
                    </H2>
                    <p className="max-w-md text-base text-muted-foreground sm:text-lg">
                        {t("landingPage.testimonials.subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {TESTIMONIALS.map((testimonial) => (
                        <Card
                            key={testimonial.nameKey}
                            className="border-border/20 bg-card shadow-sm"
                        >
                            <CardContent className="flex h-full flex-col justify-between gap-10 p-10">
                                <div className="space-y-8">
                                    <Quote className="h-8 w-8 text-primary/40" />
                                    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                                        "{t(testimonial.quoteKey)}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden border border-border/20 bg-background/70">
                                        {testimonial.image ? (
                                            <img
                                                src={testimonial.image}
                                                className="h-full w-full object-cover saturate-0"
                                                alt={""}
                                            />
                                        ) : (
                                            <span className="text-base font-medium text-primary">
                                                {t(testimonial.nameKey).charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-primary">
                                            {t(testimonial.nameKey)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
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
