import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { useRef, useState } from "react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { NAV_FOCUS_CLASS } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { LandingSection } from "@/features/landing/components/common/LandingSection.tsx";
import {
    HEADLINE_COMPONENTS,
    SectionHeading,
} from "@/features/landing/components/common/SectionHeading.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import { cn } from "@/lib/utils.ts";
import { useUserPreferences } from "@/features/preferences/hooks/useUserPreferences.tsx";
import { parseLanguage } from "@/data/internal/common/Language.ts";
import { useNewsletterSubscription } from "@/features/newsletter/api/useNewsletterSubscription.ts";

function getNewsletterSchema(t: (key: string) => string) {
    return z.object({
        email: z
            .string()
            .min(1, t("landingPage.newsletter.emailRequired"))
            .email(t("landingPage.newsletter.emailRequired")),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    });
}

type NewsletterFormData = z.infer<ReturnType<typeof getNewsletterSchema>>;

export default function NewsletterSection() {
    const { t, i18n } = useTranslation();
    const { preferences } = useUserPreferences();
    const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
    const isSubmittingRef = useRef(false);

    const schema = getNewsletterSchema(t);

    const form = useForm<NewsletterFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
        },
    });

    const { mutateAsync: subscribe, isPending } = useNewsletterSubscription();

    // Every request, signed in or not, only asks the backend to send a double opt-in email.
    // Account consent is not touched here; it changes only after the emailed link is confirmed.
    const onSubmit = async (data: NewsletterFormData) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        try {
            await subscribe({
                email: data.email,
                firstName: data.firstName || undefined,
                lastName: data.lastName || undefined,
                language: parseLanguage(i18n.language),
                currency: preferences.currency,
            });
            setRequestedEmail(data.email);
            form.reset();
        } catch (error) {
            form.setError("root", {
                message: error instanceof Error ? error.message : t("apiErrors.unknown"),
            });
        } finally {
            isSubmittingRef.current = false;
        }
    };

    const isBusy = isPending || form.formState.isSubmitting;

    const fieldClass =
        "h-[54px] min-w-0 rounded-lg border-0 bg-[rgba(23,13,14,0.35)] px-4 text-base text-ink shadow-field outline-none placeholder:text-on-oxblood-placeholder focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass aria-invalid:shadow-[inset_0_0_0_1px_var(--brass-light)]";

    return (
        <LandingSection
            ground="oxblood"
            id={LANDING_PAGE_FRAGMENTS.newsletter}
            labelledBy="newsletter-heading"
            className="py-[clamp(64px,9vw,120px)]"
            containerClassName="grid grid-cols-1 items-end gap-7 lg:grid-cols-2 lg:gap-12"
        >
            <SectionHeading
                id="newsletter-heading"
                onInk
                eyebrowClassName="text-brass-light"
                eyebrow={t("landingPage.newsletter.eyebrow")}
                title={
                    <Trans
                        i18nKey="landingPage.newsletter.title"
                        components={HEADLINE_COMPONENTS}
                    />
                }
                intro={
                    <span className="text-on-oxblood-muted">
                        {t("landingPage.newsletter.description")}
                    </span>
                }
            />

            {requestedEmail !== null ? (
                <div
                    role="status"
                    className="flex flex-col gap-3 rounded-lg bg-[rgba(23,13,14,0.35)] p-6 shadow-field"
                >
                    <p className="flex items-center gap-3 font-serif text-title-sm font-normal italic">
                        <MailCheck
                            aria-hidden="true"
                            className="size-6 shrink-0 text-brass-light"
                            strokeWidth={1.6}
                        />
                        {t("landingPage.newsletter.successMessage")}
                    </p>
                    <p className="text-body-sm text-on-oxblood-muted">
                        {t("landingPage.newsletter.successEmailSent", { email: requestedEmail })}
                    </p>
                    <p className="text-xs text-on-oxblood-muted">
                        {t("landingPage.newsletter.successTiming")}
                    </p>
                </div>
            ) : (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-3 sm:gap-3.5"
                        noValidate
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="gap-0">
                                        <FormLabel className="sr-only">
                                            {t("landingPage.newsletter.firstNameLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <input
                                                autoComplete="given-name"
                                                placeholder={t(
                                                    "landingPage.newsletter.firstNamePlaceholder",
                                                )}
                                                className={cn(fieldClass, "w-full")}
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
                                    <FormItem className="gap-0">
                                        <FormLabel className="sr-only">
                                            {t("landingPage.newsletter.lastNameLabel")}
                                        </FormLabel>
                                        <FormControl>
                                            <input
                                                autoComplete="family-name"
                                                placeholder={t(
                                                    "landingPage.newsletter.lastNamePlaceholder",
                                                )}
                                                className={cn(fieldClass, "w-full")}
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="gap-2">
                                    <FormLabel className="sr-only">
                                        {t("landingPage.newsletter.emailLabel")}
                                    </FormLabel>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-2">
                                        <FormControl>
                                            <input
                                                type="email"
                                                autoComplete="email"
                                                aria-required="true"
                                                placeholder={t(
                                                    "landingPage.newsletter.placeholder",
                                                )}
                                                className={cn(fieldClass, "sm:flex-[1_1_220px]")}
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="submit"
                                            data-theme="light"
                                            disabled={isBusy}
                                            aria-busy={isBusy}
                                            className={cn(
                                                "inline-flex h-[54px] cursor-pointer items-center justify-center gap-2 rounded-pill bg-surface px-7 text-base font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-35 sm:rounded-lg sm:text-[15px]",
                                                NAV_FOCUS_CLASS,
                                            )}
                                        >
                                            {isBusy && <Spinner />}
                                            {t("landingPage.newsletter.button")}
                                        </button>
                                    </div>
                                    <FormMessage className="text-brass-light" />
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <p
                                role="alert"
                                className="rounded-md bg-[rgba(23,13,14,0.35)] px-3 py-2 text-sm text-brass-light"
                            >
                                {form.formState.errors.root.message}
                            </p>
                        )}

                        <p className="text-xs leading-relaxed text-on-oxblood-muted">
                            {t("newsletter.purpose")}
                        </p>
                        <p className="text-xs leading-relaxed text-on-oxblood-muted">
                            <Trans
                                i18nKey="landingPage.newsletter.privacy"
                                components={{
                                    privacyLink: (
                                        <Link
                                            to="/$lng/privacy"
                                            className="underline underline-offset-3 hover:text-ink"
                                            params={true}
                                            from="/$lng"
                                        />
                                    ),
                                }}
                            />
                        </p>
                    </form>
                </Form>
            )}
        </LandingSection>
    );
}
