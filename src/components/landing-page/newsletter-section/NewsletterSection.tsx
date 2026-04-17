import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, CheckCircle } from "lucide-react";
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
            className="bg-primary px-4 py-24 sm:px-8"
            aria-label={t("landingPage.newsletter.title")}
        >
            <div className="mx-auto max-w-4xl text-center">
                <H2 className="sm:text-5xl font-normal mb-4 text-primary-foreground">
                    {t("landingPage.newsletter.title")}
                </H2>
                <div className="w-24 h-px bg-primary-foreground/30 mx-auto my-4" />
                <p className="sm:text-lg text-md text-primary-foreground/80 max-w-2xl mx-auto mb-12">
                    {t("landingPage.newsletter.description")}
                </p>

                {isSuccess ? (
                    <div className="flex flex-col items-center gap-4 text-primary-foreground">
                        <CheckCircle className="size-12" />
                        <p className="text-lg font-medium">
                            {t("landingPage.newsletter.successMessage")}
                        </p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="mx-auto max-w-xl space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-primary-foreground sr-only">
                                            {t("landingPage.newsletter.emailLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    placeholder={t(
                                                        "landingPage.newsletter.placeholder",
                                                    )}
                                                    className="h-12 pl-10 bg-white text-foreground"
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
                                            <FormLabel className="text-primary-foreground sr-only">
                                                {t("landingPage.newsletter.firstNameLabel")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        "landingPage.newsletter.firstNamePlaceholder",
                                                    )}
                                                    className="h-12 bg-white text-foreground"
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
                                            <FormLabel className="text-primary-foreground sr-only">
                                                {t("landingPage.newsletter.lastNameLabel")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t(
                                                        "landingPage.newsletter.lastNamePlaceholder",
                                                    )}
                                                    className="h-12 bg-white text-foreground"
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
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="border-primary-foreground/50 data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary data-[state=checked]:border-primary-foreground mt-0.5"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm text-primary-foreground/90 font-normal leading-snug cursor-pointer">
                                            {t("landingPage.newsletter.marketingConsent")}
                                        </FormLabel>
                                        <FormMessage className="text-destructive-foreground" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium text-base"
                            >
                                {isPending && <Spinner className="mr-2" />}
                                {t("landingPage.newsletter.button")}
                            </Button>

                            <p className="text-xs text-primary-foreground/60 mt-4">
                                {t("landingPage.newsletter.privacy")}
                            </p>
                        </form>
                    </Form>
                )}

                <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
                    <span className="flex items-center gap-2">
                        <CheckCircle className="size-4" />
                        {t("landingPage.newsletter.benefit1")}
                    </span>
                    <span className="flex items-center gap-2">
                        <CheckCircle className="size-4" />
                        {t("landingPage.newsletter.benefit2")}
                    </span>
                    <span className="flex items-center gap-2">
                        <CheckCircle className="size-4" />
                        {t("landingPage.newsletter.benefit3")}
                    </span>
                </div>
            </div>
        </section>
    );
}
