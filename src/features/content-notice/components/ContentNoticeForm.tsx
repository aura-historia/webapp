import type { TFunction } from "i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Check, LoaderCircle, Plus, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { type FieldErrors, type UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { mapToBackendLanguage, parseLanguage } from "@/data/internal/common/Language.ts";
import { useUserAccount } from "@/features/account-management/hooks/useUserAccount.ts";
import { CONTACT_EMAIL } from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { useResolvedAuth } from "@/features/authentication/hooks/useResolvedAuth.ts";
import {
    type ContentNoticeSubmitError,
    useSubmitContentNotice,
} from "@/features/content-notice/api/useSubmitContentNotice.ts";
import { ContentNoticeTargetCard } from "@/features/content-notice/components/ContentNoticeTargetCard.tsx";
import {
    buildContentNoticeRequest,
    type ContentNoticeRequest,
    CONTENT_NOTICE_ROLES,
    contactOptional,
    type ContentNoticeFieldPath,
    type ContentNoticeFormValues,
    type ContentNoticeReason,
    type ContentNoticeRole,
    EMPTY_CONTENT_NOTICE_FORM,
    fieldForPointer,
    getContentNoticeSchema,
    MAX_ADDITIONAL_URLS,
    MAX_EXPLANATION_LENGTH,
    reasonsForRole,
} from "@/features/content-notice/lib/contentNoticeForm.ts";
import {
    ALERT_CLASS,
    FIELD_CLASS,
    FIELD_ERROR_CLASS,
    FOCUS_CLASS,
    HINT_CLASS,
    LABEL_CLASS,
    OPTION_CARD_CLASS,
    PRIMARY_BUTTON_CLASS,
    RADIO_CLASS,
    SECTION_NUMBER_CLASS,
    SECTION_TITLE_CLASS,
    SMALL_SECONDARY_BUTTON_CLASS,
    TEXT_LINK_CLASS,
    TEXTAREA_CLASS,
} from "@/features/content-notice/lib/contentNoticeStyles.ts";
import type {
    ContentNoticeScope,
    ContentNoticeTarget,
} from "@/features/content-notice/lib/contentNoticeTarget.ts";
import {
    buildRemovalMailto,
    providerStatusPageUrl,
} from "@/features/provider-status/lib/providerStatusLinks.ts";
import { cn } from "@/lib/utils.ts";

export type ContentNoticeSubmission = {
    /** Absent for an anonymous report of illegal content: no receipt, no decision e-mail. */
    readonly email?: string;
    readonly reasonCategory: ContentNoticeReason;
    readonly scope: ContentNoticeScope;
};

type ContentNoticeFormProps = {
    readonly target: ContentNoticeTarget;
    readonly onSubmitted: (submission: ContentNoticeSubmission) => void;
    /** The target was removed between loading the page and sending the notice (404). */
    readonly onTargetGone: () => void;
};

const ROLE_KEYS: Record<ContentNoticeRole, string> = {
    PROVIDER: "provider",
    RIGHTS_HOLDER: "rightsHolder",
    ILLEGAL_CONTENT_REPORTER: "illegalContentReporter",
    OTHER: "other",
};

const REASON_KEYS: Record<ContentNoticeReason, string> = {
    PROVIDER_OPT_OUT: "providerOptOut",
    RIGHTS_INFRINGEMENT: "rightsInfringement",
    ILLEGAL_CONTENT: "illegalContent",
    INCORRECT_INFORMATION: "incorrectInformation",
    OTHER: "other",
};

/** Field ids, so the error summary links and focus land on the right control. */
const FIELD_IDS: Record<
    Exclude<ContentNoticeFieldPath, `additionalUrls.${number}.value`>,
    string
> = {
    submitterRole: "content-notice-role",
    reasonCategory: "content-notice-reason",
    explanation: "content-notice-explanation",
    name: "content-notice-name",
    email: "content-notice-email",
    goodFaithConfirmed: "content-notice-good-faith",
};

const urlFieldId = (index: number) => `content-notice-url-${index}`;

/** A failure shown above the button; without an e-mail the backend limits notices per target. */
type FormFailure = "rateLimited" | "rateLimitedAnonymous" | "unavailable";

type SubmitOutcome =
    | { readonly kind: "targetGone" }
    | { readonly kind: "field"; readonly field: ContentNoticeFieldPath }
    | { readonly kind: "failure"; readonly failure: FormFailure };

/** What a failed submission means for the form. */
function submitOutcome(
    error: ContentNoticeSubmitError,
    urlFormIndexes: readonly number[],
    anonymous: boolean,
): SubmitOutcome {
    if (error.failure === "notFound") return { kind: "targetGone" };
    const field =
        error.failure === "invalid" ? fieldForPointer(error.field, urlFormIndexes) : undefined;
    if (field) return { kind: "field", field };
    if (error.failure !== "rateLimited") return { kind: "failure", failure: "unavailable" };
    return { kind: "failure", failure: anonymous ? "rateLimitedAnonymous" : "rateLimited" };
}

/** The notice as reported to the page after the `202`. */
function submissionOf(request: ContentNoticeRequest): ContentNoticeSubmission {
    return {
        email: request.body.email ?? undefined,
        reasonCategory: request.body.reasonCategory,
        scope: request.body.target.type === "PRODUCT_LISTING" ? "listing" : "provider",
    };
}

/** Routes a failed submission to the page, a field or the alert above the button. */
function applyOutcome(
    outcome: SubmitOutcome,
    handlers: {
        readonly onTargetGone: () => void;
        readonly onField: (field: ContentNoticeFieldPath, messageKey: string) => void;
        readonly onFailure: (failure: FormFailure) => void;
    },
) {
    if (outcome.kind === "targetGone") return handlers.onTargetGone();
    if (outcome.kind === "failure") return handlers.onFailure(outcome.failure);
    handlers.onField(
        outcome.field,
        outcome.field.startsWith("additionalUrls")
            ? "contentNotice.errors.urlRejected"
            : "contentNotice.errors.notAccepted",
    );
}

/** The e-mail fallback for a `429`: subject and page only, never what the person typed. */
function fallbackMailto(t: TFunction, target: ContentNoticeTarget, language: string): string {
    const page =
        target.kind === "listing"
            ? {
                  scope: "listing" as const,
                  productListingTitleSlugId: target.productListingTitleSlugId,
              }
            : { scope: "provider" as const, shopSlugId: target.providerSlugId };
    return buildRemovalMailto(t, {
        scope: target.kind,
        providerName: target.providerName,
        pageUrl: providerStatusPageUrl(page, language) ?? "",
    });
}

function submitLabelKey(pending: boolean, failure: FormFailure | null): string {
    if (pending) return "contentNotice.submitting";
    return failure === "unavailable" ? "contentNotice.retry" : "contentNotice.submit";
}

/** Signed in: fills in name and e-mail from the account once, after hydration. Both stay editable. */
/**
 * Only a provider may opt out: picking another role clears that reason. Name and e-mail are
 * optional only for a report of illegal content, so a role change after a submit re-checks them.
 */
function useRoleRules(
    form: UseFormReturn<ContentNoticeFormValues>,
    role: ContentNoticeFormValues["submitterRole"],
    reason: ContentNoticeFormValues["reasonCategory"],
) {
    const { setValue, trigger, formState } = form;
    const submitted = formState.isSubmitted;
    useEffect(() => {
        if (role !== "PROVIDER" && reason === "PROVIDER_OPT_OUT") {
            setValue("reasonCategory", "", { shouldValidate: submitted });
        }
        if (submitted && role) void trigger(["name", "email"]);
    }, [role, reason, setValue, trigger, submitted]);
}

function useAccountPrefill(form: UseFormReturn<ContentNoticeFormValues>) {
    const { isAuthenticated } = useResolvedAuth();
    const { data: account } = useUserAccount(isAuthenticated);
    const [prefilled, setPrefilled] = useState(false);
    useEffect(() => {
        if (!account || prefilled) return;
        const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
        if (fullName && !form.getValues("name")) form.setValue("name", fullName);
        if (account.email && !form.getValues("email")) form.setValue("email", account.email);
        setPrefilled(true);
    }, [account, prefilled, form]);
    return Boolean(account);
}

type SummaryItem = { readonly id: string; readonly message: string };

/** Errors in page order: links, role, reason, explanation, name, e-mail, good faith. */
function summaryItems(
    errors: FieldErrors<ContentNoticeFormValues>,
    linkLabel: (number: number, message: string) => string,
): SummaryItem[] {
    const items: SummaryItem[] = [];
    errors.additionalUrls?.forEach?.((entry, index) => {
        const message = entry?.value?.message;
        if (message) items.push({ id: urlFieldId(index), message: linkLabel(index + 1, message) });
    });
    for (const field of Object.keys(FIELD_IDS) as (keyof typeof FIELD_IDS)[]) {
        const message = errors[field]?.message;
        if (message) items.push({ id: FIELD_IDS[field], message });
    }
    return items;
}

function FieldError({ id, children }: { readonly id: string; readonly children?: ReactNode }) {
    if (!children) return null;
    return (
        <p id={id} className={FIELD_ERROR_CLASS}>
            <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" strokeWidth={2} />
            {children}
        </p>
    );
}

function Section({
    number,
    title,
    lead,
    children,
}: {
    readonly number: string;
    readonly title: string;
    readonly lead?: string;
    readonly children: ReactNode;
}) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <span aria-hidden="true" className={SECTION_NUMBER_CLASS}>
                    {number}
                </span>
                <h2 id={titleId} className={SECTION_TITLE_CLASS}>
                    {title}
                </h2>
                {lead && <p className="text-sm leading-[1.55] text-ink-secondary">{lead}</p>}
            </div>
            {children}
        </section>
    );
}

/**
 * The notice form (board "Content notice · Form"). Validates on submit, then shows a focused error
 * summary; field errors the backend returns land on the same fields. Nothing typed here is logged,
 * tracked or put into a URL.
 */
export function ContentNoticeForm({ target, onSubmitted, onTargetGone }: ContentNoticeFormProps) {
    const { t, i18n } = useTranslation();
    const schema = useMemo(() => getContentNoticeSchema(t), [t]);
    const form = useForm<ContentNoticeFormValues>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_CONTENT_NOTICE_FORM,
        shouldFocusError: false,
    });
    const { register, control, handleSubmit, setValue, setError, watch, formState } = form;
    const urls = useFieldArray({ control, name: "additionalUrls" });
    const submit = useSubmitContentNotice();
    const [summaryShown, setSummaryShown] = useState(false);
    const [serverRejected, setServerRejected] = useState(false);
    const [failure, setFailure] = useState<FormFailure | null>(null);
    const summaryRef = useRef<HTMLDivElement>(null);

    const role = watch("submitterRole");
    const anonymousAllowed = contactOptional(role);
    const reason = watch("reasonCategory");
    const explanationLength = watch("explanation").trim().length;

    useRoleRules(form, role, reason);

    const account = useAccountPrefill(form);

    const showSummary = () => {
        setSummaryShown(true);
        requestAnimationFrame(() => summaryRef.current?.focus());
    };

    const onValid = (values: ContentNoticeFormValues) => {
        setFailure(null);
        setServerRejected(false);
        setSummaryShown(false);
        const language = mapToBackendLanguage(parseLanguage(i18n.language)) ?? "en";
        const request = buildContentNoticeRequest(values, target, language);
        submit.mutate(request, {
            onSuccess: () => onSubmitted(submissionOf(request)),
            onError: (error) =>
                applyOutcome(submitOutcome(error, request.urlFormIndexes, !request.body.email), {
                    onTargetGone,
                    onField: (field, message) => {
                        setError(field, { type: "server", message: t(message) });
                        setServerRejected(true);
                        showSummary();
                    },
                    onFailure: setFailure,
                }),
        });
    };

    const onInvalid = () => {
        setServerRejected(false);
        setFailure(null);
        showSummary();
    };

    const items = summaryItems(formState.errors, (number, message) =>
        t("contentNotice.summary.link", { number, message }),
    );
    const pending = submit.isPending;
    const optOut = reason === "PROVIDER_OPT_OUT";
    const mailto = fallbackMailto(t, target, i18n.language);
    const fallbackEmail = <strong className="font-semibold text-ink" />;
    const explanationHintKey = reason ? REASON_KEYS[reason] : "default";
    const roleError = formState.errors.submitterRole?.message;
    const reasonError = formState.errors.reasonCategory?.message;
    const explanationError = formState.errors.explanation?.message;
    const nameError = formState.errors.name?.message;
    const emailError = formState.errors.email?.message;
    const goodFaithError = formState.errors.goodFaithConfirmed?.message;
    const goodFaith = watch("goodFaithConfirmed");

    return (
        <form
            noValidate
            onSubmit={handleSubmit(onValid, onInvalid)}
            aria-label={t("contentNotice.formLabel")}
            className="m-0"
        >
            <fieldset
                disabled={pending}
                className="m-0 flex min-w-0 flex-col gap-9 border-0 p-0 sm:gap-12"
            >
                {summaryShown && items.length > 0 && (
                    <div
                        ref={summaryRef}
                        role="alert"
                        tabIndex={-1}
                        aria-labelledby="content-notice-summary-title"
                        className={cn(
                            ALERT_CLASS,
                            "shadow-[inset_0_0_0_1.5px_var(--oxblood)]",
                            FOCUS_CLASS,
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className="inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-oxblood text-on-oxblood"
                        >
                            <AlertCircle className="size-3.5" strokeWidth={2.4} />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <p
                                id="content-notice-summary-title"
                                className="text-[15px] leading-[1.4] font-semibold"
                            >
                                {serverRejected
                                    ? t("contentNotice.summary.serverTitle")
                                    : t("contentNotice.summary.title", { count: items.length })}
                            </p>
                            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm leading-normal">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={`#${item.id}`}
                                            onClick={(event) => {
                                                const field = document.getElementById(item.id);
                                                if (!field) return;
                                                event.preventDefault();
                                                field.focus();
                                                field.scrollIntoView({ block: "center" });
                                            }}
                                            className={TEXT_LINK_CLASS}
                                        >
                                            {item.message}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <Section number="01" title={t("contentNotice.sections.what")}>
                    <ContentNoticeTargetCard target={target} scopeField={register("scope")} />
                    <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                            <span id="content-notice-urls-label" className={LABEL_CLASS}>
                                {t("contentNotice.urls.label")}{" "}
                                <span className="font-normal text-ink-muted">
                                    {t("contentNotice.optional")}
                                </span>
                            </span>
                            <span id="content-notice-urls-hint" className={HINT_CLASS}>
                                {t("contentNotice.urls.hint")}
                            </span>
                        </div>
                        {urls.fields.map((field, index) => {
                            const error = formState.errors.additionalUrls?.[index]?.value?.message;
                            const errorId = `${urlFieldId(index)}-error`;
                            return (
                                <div key={field.id} className="flex flex-col gap-1.5">
                                    <div className="flex gap-2">
                                        <input
                                            id={urlFieldId(index)}
                                            type="url"
                                            inputMode="url"
                                            autoComplete="off"
                                            placeholder="https://"
                                            {...register(`additionalUrls.${index}.value`)}
                                            aria-labelledby="content-notice-urls-label"
                                            aria-describedby={cn(
                                                "content-notice-urls-hint",
                                                error && errorId,
                                            )}
                                            aria-invalid={Boolean(error)}
                                            className={FIELD_CLASS}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                urls.fields.length > 1
                                                    ? urls.remove(index)
                                                    : setValue(`additionalUrls.${index}.value`, "")
                                            }
                                            aria-label={t("contentNotice.urls.remove", {
                                                number: index + 1,
                                            })}
                                            className={cn(
                                                "inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink",
                                                FOCUS_CLASS,
                                            )}
                                        >
                                            <X
                                                aria-hidden="true"
                                                className="size-4"
                                                strokeWidth={1.8}
                                            />
                                        </button>
                                    </div>
                                    <FieldError id={errorId}>{error}</FieldError>
                                </div>
                            );
                        })}
                        {urls.fields.length < MAX_ADDITIONAL_URLS ? (
                            <button
                                type="button"
                                onClick={() => urls.append({ value: "" })}
                                className={SMALL_SECONDARY_BUTTON_CLASS}
                            >
                                <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />
                                {t(
                                    urls.fields.length > 0
                                        ? "contentNotice.urls.addAnother"
                                        : "contentNotice.urls.add",
                                )}
                            </button>
                        ) : (
                            <output className="block text-meta leading-normal text-ink-muted">
                                {t("contentNotice.urls.limit", { max: MAX_ADDITIONAL_URLS })}
                            </output>
                        )}
                    </div>
                </Section>

                <div aria-hidden="true" className="h-px bg-line-subtle" />

                <Section number="02" title={t("contentNotice.sections.role")}>
                    <fieldset
                        id={FIELD_IDS.submitterRole}
                        tabIndex={-1}
                        aria-describedby={
                            roleError ? `${FIELD_IDS.submitterRole}-error` : undefined
                        }
                        className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0 outline-none"
                    >
                        <legend className="sr-only">{t("contentNotice.sections.role")}</legend>
                        {CONTENT_NOTICE_ROLES.map((value) => (
                            <OptionCard
                                key={value}
                                value={value}
                                field={register("submitterRole")}
                                invalid={Boolean(roleError)}
                                label={t(`contentNotice.roles.${ROLE_KEYS[value]}.label`)}
                                description={t(
                                    `contentNotice.roles.${ROLE_KEYS[value]}.description`,
                                )}
                                large
                            />
                        ))}
                        <FieldError id={`${FIELD_IDS.submitterRole}-error`}>{roleError}</FieldError>
                    </fieldset>
                </Section>

                <div aria-hidden="true" className="h-px bg-line-subtle" />

                <Section number="03" title={t("contentNotice.sections.reason")}>
                    <fieldset
                        id={FIELD_IDS.reasonCategory}
                        tabIndex={-1}
                        aria-describedby={
                            reasonError ? `${FIELD_IDS.reasonCategory}-error` : undefined
                        }
                        className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0 outline-none"
                    >
                        <legend className={cn(LABEL_CLASS, "mb-2.5 p-0")}>
                            {t("contentNotice.reasons.legend")}
                        </legend>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {reasonsForRole(role).map((value) => (
                                <OptionCard
                                    key={value}
                                    value={value}
                                    field={register("reasonCategory")}
                                    invalid={Boolean(reasonError)}
                                    label={t(`contentNotice.reasons.${REASON_KEYS[value]}.label`)}
                                    description={t(
                                        `contentNotice.reasons.${REASON_KEYS[value]}.description`,
                                    )}
                                />
                            ))}
                        </div>
                        <FieldError id={`${FIELD_IDS.reasonCategory}-error`}>
                            {reasonError}
                        </FieldError>
                    </fieldset>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-baseline justify-between gap-3">
                            <label htmlFor={FIELD_IDS.explanation} className={LABEL_CLASS}>
                                {t("contentNotice.explanation.label")}
                                {optOut && (
                                    <span className="font-normal text-ink-muted">
                                        {" "}
                                        {t("contentNotice.optional")}
                                    </span>
                                )}
                            </label>
                            <span
                                id={`${FIELD_IDS.explanation}-count`}
                                className={cn(
                                    "font-mono text-[11px] tracking-[0.06em]",
                                    explanationLength > MAX_EXPLANATION_LENGTH
                                        ? "text-oxblood"
                                        : "text-ink-muted",
                                )}
                            >
                                {t("contentNotice.explanation.counter", {
                                    count: explanationLength.toLocaleString(i18n.language),
                                    max: MAX_EXPLANATION_LENGTH.toLocaleString(i18n.language),
                                })}
                            </span>
                        </div>
                        <span id={`${FIELD_IDS.explanation}-hint`} className={HINT_CLASS}>
                            {t(`contentNotice.explanation.hints.${explanationHintKey}`)}
                        </span>
                        <textarea
                            id={FIELD_IDS.explanation}
                            rows={7}
                            {...register("explanation")}
                            aria-required={!optOut}
                            aria-invalid={Boolean(explanationError)}
                            aria-describedby={cn(
                                `${FIELD_IDS.explanation}-hint`,
                                `${FIELD_IDS.explanation}-count`,
                                explanationError && `${FIELD_IDS.explanation}-error`,
                            )}
                            className={TEXTAREA_CLASS}
                        />
                        <FieldError id={`${FIELD_IDS.explanation}-error`}>
                            {explanationError}
                        </FieldError>
                    </div>
                </Section>

                <div aria-hidden="true" className="h-px bg-line-subtle" />

                <Section
                    number="04"
                    title={t("contentNotice.sections.contact")}
                    lead={t(
                        anonymousAllowed
                            ? "contentNotice.sections.contactLeadOptional"
                            : "contentNotice.sections.contactLead",
                    )}
                >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <TextField
                            id={FIELD_IDS.name}
                            label={t("contentNotice.contact.name")}
                            optional={anonymousAllowed}
                            autoComplete="name"
                            error={nameError}
                            describedBy={account ? "content-notice-prefilled" : undefined}
                            field={register("name")}
                        />
                        <TextField
                            id={FIELD_IDS.email}
                            label={t("contentNotice.contact.email")}
                            optional={anonymousAllowed}
                            type="email"
                            autoComplete="email"
                            error={emailError}
                            describedBy={account ? "content-notice-prefilled" : undefined}
                            field={register("email")}
                        />
                    </div>
                    {account && (
                        <p id="content-notice-prefilled" className={HINT_CLASS}>
                            {t("contentNotice.contact.prefilled")}
                        </p>
                    )}
                    <p className="text-meta leading-[1.6] text-ink-secondary">
                        <Trans
                            i18nKey="contentNotice.contact.privacy"
                            components={{
                                privacyLink: (
                                    <Link
                                        to="/$lng/privacy"
                                        params={true}
                                        from="/$lng"
                                        className={TEXT_LINK_CLASS}
                                    />
                                ),
                            }}
                        />
                    </p>
                </Section>

                <div className="flex flex-col gap-5 border-t border-line-subtle pt-7">
                    <div className="flex flex-col gap-2">
                        <label
                            className={cn(
                                "relative flex cursor-pointer items-start gap-3 rounded-lg bg-surface-raised p-4",
                                goodFaithError
                                    ? "shadow-[inset_0_0_0_1.5px_var(--oxblood)]"
                                    : "shadow-field",
                                "has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-brass",
                            )}
                        >
                            <input
                                id={FIELD_IDS.goodFaithConfirmed}
                                type="checkbox"
                                {...register("goodFaithConfirmed")}
                                aria-required="true"
                                aria-invalid={Boolean(goodFaithError)}
                                aria-describedby={
                                    goodFaithError
                                        ? `${FIELD_IDS.goodFaithConfirmed}-error`
                                        : undefined
                                }
                                className="peer sr-only"
                            />
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-[4px] text-on-oxblood",
                                    goodFaith
                                        ? "bg-oxblood"
                                        : "bg-surface-raised shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
                                )}
                            >
                                {goodFaith && <Check className="size-3" strokeWidth={3.2} />}
                            </span>
                            <span className="text-sm leading-normal">
                                {t("contentNotice.goodFaith")}
                            </span>
                        </label>
                        <FieldError id={`${FIELD_IDS.goodFaithConfirmed}-error`}>
                            {goodFaithError}
                        </FieldError>
                    </div>

                    {failure && (
                        <div
                            role="alert"
                            className={cn(ALERT_CLASS, "shadow-[inset_0_0_0_1px_var(--oxblood)]")}
                        >
                            <span
                                aria-hidden="true"
                                className="inline-flex size-6 shrink-0 items-center justify-center rounded-pill text-oxblood shadow-[inset_0_0_0_1.5px_var(--oxblood)]"
                            >
                                <AlertCircle className="size-3.5" strokeWidth={2.4} />
                            </span>
                            <div className="flex flex-col gap-1.5 text-sm leading-[1.55] text-ink-secondary">
                                <p className="font-semibold text-ink">
                                    {t(`contentNotice.alerts.${failure}.title`)}
                                </p>
                                <p>
                                    <Trans
                                        i18nKey={`contentNotice.alerts.${failure}.body`}
                                        values={{ email: CONTACT_EMAIL }}
                                        components={{ email: fallbackEmail }}
                                    />{" "}
                                    {failure !== "unavailable" && (
                                        <a href={mailto} className={TEXT_LINK_CLASS}>
                                            {t("contentNotice.alerts.writeEmail")}
                                        </a>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-stretch sm:flex-row sm:justify-end">
                        <button type="submit" disabled={pending} className={PRIMARY_BUTTON_CLASS}>
                            {pending && (
                                <LoaderCircle
                                    aria-hidden="true"
                                    className="size-4 animate-spin"
                                    strokeWidth={2}
                                />
                            )}
                            {t(submitLabelKey(pending, failure))}
                        </button>
                    </div>
                </div>
            </fieldset>
        </form>
    );
}

function OptionCard({
    value,
    field,
    invalid,
    label,
    description,
    large = false,
}: {
    readonly value: string;
    readonly field: ReturnType<ReturnType<typeof useForm<ContentNoticeFormValues>>["register"]>;
    readonly invalid: boolean;
    readonly label: string;
    readonly description: string;
    readonly large?: boolean;
}) {
    const descriptionId = useId();
    return (
        <label data-invalid={invalid} className={cn(OPTION_CARD_CLASS, large && "px-4")}>
            <input
                type="radio"
                value={value}
                {...field}
                aria-describedby={descriptionId}
                className={RADIO_CLASS}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span
                    className={cn("leading-[1.35] font-medium", large ? "text-[15px]" : "text-sm")}
                >
                    {label}
                </span>
                <span
                    id={descriptionId}
                    className={cn("leading-normal text-ink-muted", large ? "text-meta" : "text-xs")}
                >
                    {description}
                </span>
            </span>
        </label>
    );
}

function OptionalMark() {
    const { t } = useTranslation();
    return <span className="font-normal text-ink-muted"> {t("contentNotice.optional")}</span>;
}

function TextField({
    id,
    label,
    optional = false,
    type = "text",
    autoComplete,
    error,
    describedBy,
    field,
}: {
    readonly id: string;
    readonly label: string;
    /** Only a report of illegal content may leave name and e-mail empty. */
    readonly optional?: boolean;
    readonly type?: "text" | "email";
    readonly autoComplete: string;
    readonly error?: string;
    readonly describedBy?: string;
    readonly field: ReturnType<ReturnType<typeof useForm<ContentNoticeFormValues>>["register"]>;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={id} className={LABEL_CLASS}>
                {label}
                {optional && <OptionalMark />}
            </label>
            <input
                id={id}
                type={type}
                inputMode={type === "email" ? "email" : undefined}
                autoComplete={autoComplete}
                {...field}
                aria-required={!optional}
                aria-invalid={Boolean(error)}
                aria-describedby={cn(error && `${id}-error`, describedBy) || undefined}
                className={FIELD_CLASS}
            />
            <FieldError id={`${id}-error`}>{error}</FieldError>
        </div>
    );
}
