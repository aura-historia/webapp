import { CircleAlert, Info, Link2 } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { OAuthConsentClient } from "@/data/internal/oauth/OAuthClient.ts";
import type { PartnerApplication } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import { Spinner } from "@/components/ui/spinner.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { OAuthAuthorizeClientSummary } from "@/features/oauth/components/OAuthAuthorizeClientSummary.tsx";
import {
    OAuthAuthorizePageContainer,
    OAuthAuthorizeTitle,
} from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import {
    CONSENT_ACTIONS_CLASS,
    CONSENT_ALERT_CLASS,
    CONSENT_CARD_CLASS,
    CONSENT_COPY_CLASS,
    CONSENT_EYEBROW_CLASS,
    CONSENT_PANEL_CLASS,
    CONSENT_PRIMARY_BUTTON_CLASS,
} from "@/features/oauth/lib/oauthConsentStyles.ts";
import { usePartnerApplications } from "@/features/partner/application-management/api/usePartnerApplications.ts";
import { PartnerApplicationCreateDialog } from "@/features/partner/application-management/components/PartnerApplicationCreateDialog.tsx";
import { PartnerApplicationDetailDialog } from "@/features/partner/application-management/components/PartnerApplicationDetailDialog.tsx";
import { PartnerApplicationRow } from "@/features/partner/application-management/components/PartnerApplicationRow.tsx";
import { cn } from "@/lib/utils.ts";

/** Where the panel stands, from the account's applications (board "Shop connection without a provider"). */
export type NoProviderStage =
    | "none"
    | "submitted"
    | "inReview"
    | "approved"
    | "rejected"
    | "withdrawn";

/**
 * The application the panel follows: an open one is the next step, then an approved one waiting
 * for its grant, then the latest decided one. Without applications, or when they cannot be read,
 * the panel asks to apply.
 */
export function selectNoProviderApplication(
    applications: readonly PartnerApplication[] | undefined,
): { readonly stage: NoProviderStage; readonly application?: PartnerApplication } {
    const list = applications ?? [];
    const open = list.find(
        (application) => application.state === "SUBMITTED" || application.state === "IN_REVIEW",
    );
    if (open) {
        return { stage: open.state === "SUBMITTED" ? "submitted" : "inReview", application: open };
    }
    const approved = list.find((application) => application.state === "APPROVED");
    if (approved) return { stage: "approved", application: approved };
    const decided = list.find(
        (application) => application.state === "REJECTED" || application.state === "WITHDRAWN",
    );
    if (decided) {
        return {
            stage: decided.state === "REJECTED" ? "rejected" : "withdrawn",
            application: decided,
        };
    }
    return { stage: "none" };
}

const PATH_STEPS = ["apply", "review", "connect"] as const;
const ROMAN = ["I", "II", "III"] as const;

interface OAuthNoProviderConsentProps {
    readonly client: OAuthConsentClient;
    /** Blocks between the request line and the panel, e.g. the WooCommerce recipient. */
    readonly children?: ReactNode;
    /**
     * The way out beside the main action: Return without connecting for a direct request with a
     * verified callback, the broker's Decline for WooCommerce, nothing otherwise.
     */
    readonly secondaryAction?: ReactNode;
    /** Reads the granted providers again; the page shows the consent once one arrives. */
    readonly onCheckAgain: () => void;
    readonly isChecking: boolean;
    /** The last check could not read the providers. */
    readonly checkFailed: boolean;
}

/**
 * The consent card for a request that needs a provider while the account has none: apply for
 * admission here, follow the application, check again. It never grants or assumes access.
 */
export function OAuthNoProviderConsent({
    client,
    children,
    secondaryAction,
    onCheckAgain,
    isChecking,
    checkFailed,
}: OAuthNoProviderConsentProps) {
    const { t } = useTranslation();
    const ids = useId();
    const applicationsQuery = usePartnerApplications();
    const { stage, application } = selectNoProviderApplication(applicationsQuery.data);
    const [applyOpen, setApplyOpen] = useState(false);
    const [detailsId, setDetailsId] = useState<string>();
    const [checked, setChecked] = useState(false);

    const waiting = stage === "submitted" || stage === "inReview" || stage === "approved";
    const canApply = !waiting;
    const nameId = `${ids}-client`;
    const headingId = `${ids}-panel`;

    const checkAgain = () => {
        setChecked(true);
        onCheckAgain();
        void applicationsQuery.refetch();
    };

    return (
        <OAuthAuthorizePageContainer>
            <OAuthAuthorizeTitle>{t("oauth.authorize.title")}</OAuthAuthorizeTitle>

            <article aria-labelledby={nameId} className={CONSENT_CARD_CLASS}>
                <OAuthAuthorizeClientSummary client={client} nameId={nameId} />

                <p className={CONSENT_COPY_CLASS}>
                    {t("oauth.authorize.description", { appName: client.clientName })}
                </p>

                {children}

                <section
                    aria-labelledby={headingId}
                    className={cn(CONSENT_PANEL_CLASS, "gap-3.5 p-4 sm:px-[22px] sm:py-5")}
                >
                    <span className={CONSENT_EYEBROW_CLASS}>
                        {t(
                            waiting
                                ? "oauth.authorize.noProvider.eyebrowApplication"
                                : "oauth.authorize.noProvider.eyebrow",
                        )}
                    </span>
                    <h3
                        id={headingId}
                        className="font-serif text-[22px] leading-[1.2] font-normal text-ink sm:text-2xl [&_em]:italic"
                    >
                        <Trans
                            i18nKey={`oauth.authorize.noProvider.stages.${stage}.title`}
                            components={HEADLINE_COMPONENTS}
                        />
                    </h3>

                    {stage === "none" ? (
                        <>
                            <p className="text-sm leading-[1.6] text-ink-secondary">
                                {t("oauth.authorize.noProvider.stages.none.description")}
                            </p>
                            <ol aria-label={t("oauth.authorize.noProvider.pathLabel")}>
                                {PATH_STEPS.map((step, index) => (
                                    <li
                                        key={step}
                                        className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-line py-3 last:border-b"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "font-serif text-[17px] leading-[1.35]",
                                                index === 0 ? "text-oxblood" : "text-ink-muted",
                                            )}
                                        >
                                            {ROMAN[index]}
                                        </span>
                                        <span className="flex flex-col gap-0.5">
                                            <span className="text-sm leading-normal font-medium text-ink">
                                                {t(`oauth.authorize.noProvider.path.${step}.title`)}
                                            </span>
                                            <span className="text-meta leading-normal text-ink-muted">
                                                {t(
                                                    `oauth.authorize.noProvider.path.${step}.description`,
                                                )}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </>
                    ) : (
                        <>
                            {application && (
                                <ul className="border-t border-line">
                                    <li>
                                        <PartnerApplicationRow
                                            application={application}
                                            showNote={false}
                                            onOpen={() => setDetailsId(application.id)}
                                        />
                                    </li>
                                </ul>
                            )}
                            <p className="text-sm leading-[1.6] text-ink-secondary">
                                {t(`oauth.authorize.noProvider.stages.${stage}.description`)}
                            </p>
                        </>
                    )}

                    {checked && !isChecking && !checkFailed && (
                        <p
                            role="status"
                            className="flex items-start gap-2 text-meta leading-normal text-ink-muted"
                        >
                            <Info
                                aria-hidden="true"
                                className="mt-0.5 size-[15px] shrink-0"
                                strokeWidth={1.8}
                            />
                            {t("oauth.authorize.noProvider.stillNone")}
                        </p>
                    )}
                </section>

                {checkFailed && (
                    <div role="alert" className={CONSENT_ALERT_CLASS}>
                        <CircleAlert
                            aria-hidden="true"
                            className="mt-0.5 size-[18px] shrink-0 text-oxblood"
                            strokeWidth={1.8}
                        />
                        <div className="flex min-w-0 flex-col gap-1">
                            <p className="text-sm leading-normal font-semibold text-ink">
                                {t("oauth.authorize.noProvider.checkFailed.title")}
                            </p>
                            <p className="text-sm leading-[1.6] text-ink-secondary">
                                {t("oauth.authorize.noProvider.checkFailed.description")}
                            </p>
                        </div>
                    </div>
                )}

                <div className={CONSENT_ACTIONS_CLASS}>
                    {canApply ? (
                        <button
                            type="button"
                            aria-haspopup="dialog"
                            className={CONSENT_PRIMARY_BUTTON_CLASS}
                            onClick={() => setApplyOpen(true)}
                        >
                            {t(
                                stage === "none"
                                    ? "oauth.authorize.noProvider.apply"
                                    : "oauth.authorize.noProvider.applyAgain",
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={CONSENT_PRIMARY_BUTTON_CLASS}
                            disabled={isChecking}
                            aria-busy={isChecking}
                            onClick={checkAgain}
                        >
                            {isChecking && <Spinner aria-hidden="true" className="size-4" />}
                            {t(
                                isChecking
                                    ? "oauth.authorize.noProvider.checking"
                                    : "oauth.authorize.noProvider.checkAgain",
                            )}
                        </button>
                    )}
                    {secondaryAction}
                </div>
            </article>

            <PartnerApplicationCreateDialog
                open={applyOpen}
                onOpenChange={setApplyOpen}
                context={
                    <p
                        className={cn(
                            CONSENT_PANEL_CLASS,
                            "flex-row items-start gap-2.5 px-3.5 py-3 text-meta leading-normal text-ink-secondary",
                        )}
                    >
                        <Link2
                            aria-hidden="true"
                            className="mt-0.5 size-[15px] shrink-0 text-oxblood"
                            strokeWidth={1.8}
                        />
                        <span>
                            <Trans
                                i18nKey="oauth.authorize.noProvider.applicationContext"
                                values={{ appName: client.clientName }}
                                components={{ strong: <span className="font-medium text-ink" /> }}
                            />
                        </span>
                    </p>
                }
            />
            <PartnerApplicationDetailDialog
                applicationId={detailsId}
                open={Boolean(detailsId)}
                onOpenChange={(next) => {
                    if (!next) setDetailsId(undefined);
                }}
            />
        </OAuthAuthorizePageContainer>
    );
}
