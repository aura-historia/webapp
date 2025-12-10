import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterSection() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        // Simulate API call - replace with actual newsletter signup
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus("success");
        setEmail("");
    };

    return (
        <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <CardContent className="relative z-10 py-12 px-6 md:px-12">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <H2 className="mb-4">{t("landingPage.newsletter.title")}</H2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                {t("landingPage.newsletter.description")}
                            </p>
                        </div>

                        {status === "success" ? (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <CheckCircle2 className="w-16 h-16 text-tertiary" />
                                <p className="text-lg font-medium text-center">
                                    {t("landingPage.newsletter.successMessage")}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Input
                                        type="email"
                                        placeholder={t("landingPage.newsletter.placeholder")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 h-12"
                                        required
                                        aria-label={t("landingPage.newsletter.placeholder")}
                                    />
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="h-12 px-8"
                                        disabled={status === "loading"}
                                    >
                                        {status === "loading" ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            t("landingPage.newsletter.button")
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    {t("landingPage.newsletter.privacy")}
                                </p>
                            </form>
                        )}

                        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>{t("landingPage.newsletter.benefit1")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>{t("landingPage.newsletter.benefit2")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>{t("landingPage.newsletter.benefit3")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
