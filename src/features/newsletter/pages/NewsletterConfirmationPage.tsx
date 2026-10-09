import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { H1 } from "@/components/typography/H1.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { LANDING_PAGE_FRAGMENTS } from "@/features/landing/config/landingPageFragments.ts";
import {
    type NewsletterConfirmationStatus,
    useNewsletterConfirmation,
} from "@/features/newsletter/hooks/useNewsletterConfirmation.ts";

type ConfirmationView = "request" | "confirmed" | "invalid" | "missing";

const VIEW_BY_STATUS: Record<NewsletterConfirmationStatus, ConfirmationView> = {
    reading: "request",
    ready: "request",
    submitting: "request",
    failed: "request",
    confirmed: "confirmed",
    invalid: "invalid",
    missing: "missing",
};

const linkClassName = "underline underline-offset-2 hover:text-foreground";

export function NewsletterConfirmationPage() {
    const { t } = useTranslation();
    const { status, confirm } = useNewsletterConfirmation();
    const view = VIEW_BY_STATUS[status];
    const isSubmitting = status === "submitting";

    return (
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
            <div
                className="flex flex-col gap-5 rounded-xl border bg-background/60 p-6 shadow-sm sm:p-8"
                aria-live="polite"
            >
                <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground">
                    {t("newsletter.confirmation.eyebrow")}
                </p>
                <H1>{t(`newsletter.confirmation.${view}.title`)}</H1>

                {view === "request" && (
                    <>
                        <p className="text-sm leading-relaxed text-foreground">
                            {t("newsletter.confirmation.request.description")}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {t("newsletter.purpose")}{" "}
                            <Trans
                                i18nKey="newsletter.privacy"
                                components={{
                                    privacyLink: (
                                        <Link
                                            to="/$lng/privacy"
                                            className={linkClassName}
                                            params={true}
                                            from="/$lng"
                                        />
                                    ),
                                }}
                            />
                        </p>
                        {status === "failed" && (
                            <p
                                role="alert"
                                className="rounded-sm bg-destructive/10 px-3 py-2 text-sm text-destructive"
                            >
                                {t("newsletter.confirmation.request.temporaryError")}
                            </p>
                        )}
                        <Button
                            type="button"
                            onClick={confirm}
                            disabled={status === "reading" || isSubmitting}
                            aria-busy={isSubmitting}
                            className="w-full sm:w-auto sm:self-start"
                        >
                            {isSubmitting && <Spinner />}
                            {t("newsletter.confirmation.request.button")}
                        </Button>
                    </>
                )}

                {view === "confirmed" && (
                    <>
                        <p className="text-sm leading-relaxed text-foreground">
                            {t("newsletter.confirmation.confirmed.description")}
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {t("newsletter.confirmation.confirmed.unsubscribe")}
                        </p>
                        <Link
                            to="/$lng"
                            params={true}
                            from="/$lng"
                            className="text-sm font-medium text-primary underline underline-offset-2"
                        >
                            {t("newsletter.confirmation.backHome")}
                        </Link>
                    </>
                )}

                {(view === "invalid" || view === "missing") && (
                    <>
                        <p className="text-sm leading-relaxed text-foreground">
                            {t(`newsletter.confirmation.${view}.description`)}
                        </p>
                        <Link
                            to="/$lng"
                            hash={LANDING_PAGE_FRAGMENTS.newsletter}
                            params={true}
                            from="/$lng"
                            className="text-sm font-medium text-primary underline underline-offset-2"
                        >
                            {t("newsletter.confirmation.requestNew")}
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
