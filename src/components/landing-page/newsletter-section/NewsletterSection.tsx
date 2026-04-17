import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, CheckCircle, Send } from "lucide-react";
import { useState } from "react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { H2 } from "@/components/typography/H2.tsx";
import { putNewsletterSubscriptionMutation } from "@/client/@tanstack/react-query.gen.ts";

function getNewsletterSchema(t: (key: string) => string) {
    return z.object({
        email: z
            .string()
            .min(1, t("landingPage.newsletter.emailRequired"))
            .email(t("landingPage.newsletter.emailRequired")),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        marketingConsent: z.boolean().refine((val) => val === true, {
            message: t("landingPage.newsletter.marketingConsentRequired"),
        }),
    });
}

type NewsletterFormData = z.infer<ReturnType<typeof getNewsletterSchema>>;

export default function NewsletterSection() {
    const { t } = useTranslation();
    const [isSuccess, setIsSuccess] = useState(false);

    const schema = getNewsletterSchema(t);

    const form = useForm<NewsletterFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            marketingConsent: false,
        },
    });

    const { mutate: subscribe, isPending } = useMutation({
        ...putNewsletterSubscriptionMutation(),
        onSuccess: () => {
            setIsSuccess(true);
            toast.success(t("landingPage.newsletter.successMessage"));
            form.reset();
        },
        onError: () => {
            toast.error(t("landingPage.newsletter.errorMessage"));
        },
    });

    const onSubmit = (data: NewsletterFormData) => {
        subscribe({
            body: {
                email: data.email,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
            },
        });
    };

    return (
        <section
            className="relative overflow-hidden px-4 py-24 sm:px-8"
            style={{ background: "var(--linear-gradient-main)" }}
            aria-label={t("landingPage.newsletter.title")}
        >
            {/* Decorative elements */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, var(--tertiary-fixed) 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                }}
            />
            <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-primary-container/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-primary-container/20 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left column — copy + benefits */}
                    <div className="text-center lg:text-left">
                        <p className="text-[10px] uppercase tracking-[2px] text-tertiary-fixed-dim">
                            {t("landingPage.newsletter.eyebrow")}
                        </p>

                        <H2 className="mt-4 text-4xl font-normal italic leading-[1.1] text-primary-foreground sm:text-5xl">
                            {t("landingPage.newsletter.title")}
                        </H2>

                        <div className="mx-auto mt-6 h-px w-16 bg-tertiary-fixed-dim/40 lg:mx-0" />

                        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-primary-foreground/75 lg:mx-0">
                            {t("landingPage.newsletter.description")}
                        </p>

                        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 lg:justify-start">
                            <span className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                                <span className="flex size-6 shrink-0 items-center justify-center bg-primary-foreground/10">
                                    <CheckCircle className="size-3.5 text-tertiary-fixed-dim" />
                                </span>
                                {t("landingPage.newsletter.benefit1")}
                            </span>
                            <span className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                                <span className="flex size-6 shrink-0 items-center justify-center bg-primary-foreground/10">
                                    <CheckCircle className="size-3.5 text-tertiary-fixed-dim" />
                                </span>
                                {t("landingPage.newsletter.benefit2")}
                            </span>
                            <span className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                                <span className="flex size-6 shrink-0 items-center justify-center bg-primary-foreground/10">
                                    <CheckCircle className="size-3.5 text-tertiary-fixed-dim" />
                                </span>
                                {t("landingPage.newsletter.benefit3")}
                            </span>
                        </div>
                    </div>

                    {/* Right column — form card */}
                    <div className="mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto">
                        <div className="border border-primary-foreground/10 bg-primary-foreground/[0.06] p-8 backdrop-blur-sm sm:p-10">
                            {isSuccess ? (
                                <div className="flex flex-col items-center gap-5 py-8 text-center">
                                    <div className="flex size-16 items-center justify-center bg-primary-foreground/10">
                                        <CheckCircle className="size-8 text-tertiary-fixed-dim" />
                                    </div>
                                    <p className="font-display text-xl font-normal italic text-primary-foreground">
                                        {t("landingPage.newsletter.successMessage")}
                                    </p>
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-5"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="sr-only text-primary-foreground">
                                                        {t("landingPage.newsletter.emailLabel")}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                                                            <Input
                                                                type="email"
                                                                placeholder={t(
                                                                    "landingPage.newsletter.placeholder",
                                                                )}
                                                                className="h-12 border-primary-foreground/15 bg-white/95 pl-10 text-foreground shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-tertiary-fixed-dim/50 focus-visible:ring-tertiary-fixed-dim/20"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-destructive-foreground" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="sr-only text-primary-foreground">
                                                            {t(
                                                                "landingPage.newsletter.firstNameLabel",
                                                            )}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={t(
                                                                    "landingPage.newsletter.firstNamePlaceholder",
                                                                )}
                                                                className="h-12 border-primary-foreground/15 bg-white/95 text-foreground shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-tertiary-fixed-dim/50 focus-visible:ring-tertiary-fixed-dim/20"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="sr-only text-primary-foreground">
                                                            {t(
                                                                "landingPage.newsletter.lastNameLabel",
                                                            )}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={t(
                                                                    "landingPage.newsletter.lastNamePlaceholder",
                                                                )}
                                                                className="h-12 border-primary-foreground/15 bg-white/95 text-foreground shadow-sm placeholder:text-muted-foreground/60 focus-visible:border-tertiary-fixed-dim/50 focus-visible:ring-tertiary-fixed-dim/20"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="marketingConsent"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-1">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="mt-0.5 border-primary-foreground/40 data-[state=checked]:border-tertiary-fixed-dim data-[state=checked]:bg-tertiary-fixed-dim data-[state=checked]:text-primary"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="cursor-pointer text-sm font-normal leading-snug text-primary-foreground/80">
                                                        {t(
                                                            "landingPage.newsletter.marketingConsent",
                                                        )}
                                                    </FormLabel>
                                                    <FormMessage className="text-destructive-foreground" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            disabled={isPending}
                                            className="h-12 w-full bg-tertiary text-tertiary-foreground text-base font-medium shadow-sm hover:bg-tertiary-fixed-dim"
                                        >
                                            {isPending ? (
                                                <Spinner className="mr-2" />
                                            ) : (
                                                <Send className="mr-2 size-4" />
                                            )}
                                            {t("landingPage.newsletter.button")}
                                        </Button>

                                        <p className="pt-1 text-center text-xs leading-relaxed text-primary-foreground/50">
                                            {t("landingPage.newsletter.privacy")}
                                        </p>
                                    </form>
                                </Form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
