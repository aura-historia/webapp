import { ImageIcon, Info, Lock } from "lucide-react";
import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ContentNoticeTarget } from "@/features/content-notice/lib/contentNoticeTarget.ts";
import {
    LABEL_CLASS,
    MONO_LABEL_CLASS,
    OPTION_CARD_CLASS,
    RADIO_CLASS,
} from "@/features/content-notice/lib/contentNoticeStyles.ts";
import { cn } from "@/lib/utils.ts";

type ContentNoticeTargetCardProps = {
    readonly target: ContentNoticeTarget;
    /** The scope radios; only a listing offers the choice. */
    readonly scopeField: UseFormRegisterReturn<"scope">;
    readonly disabled?: boolean;
};

/**
 * The pre-filled, read-only listing or provider a notice is about, and for a listing the choice
 * between that listing and every listing of its provider (board "Content notice · Pre-filled
 * target & scope").
 */
export function ContentNoticeTargetCard({
    target,
    scopeField,
    disabled,
}: ContentNoticeTargetCardProps) {
    const { t } = useTranslation();
    const legendId = useId();
    const listing = target.kind === "listing";
    const title = listing
        ? (target.title ?? t("contentNotice.target.untitled"))
        : target.providerName;
    const status = t(
        target.partner ? "contentNotice.target.partner" : "contentNotice.target.notPartner",
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-lg bg-surface-raised p-3.5 shadow-ring sm:px-[18px] sm:py-4">
                <span
                    aria-hidden="true"
                    className="inline-flex size-14 shrink-0 items-center justify-center rounded-thumb bg-image-ground text-ink-muted sm:size-16"
                >
                    {listing ? (
                        <ImageIcon className="size-[22px]" strokeWidth={1.5} />
                    ) : (
                        <span className="font-serif text-[28px] leading-none text-ink-secondary">
                            {target.providerName.charAt(0)}
                        </span>
                    )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className={MONO_LABEL_CLASS}>
                        {t(
                            listing
                                ? "contentNotice.target.listing"
                                : "contentNotice.target.provider",
                        )}
                    </span>
                    <p className="font-serif text-lg leading-[1.2] tracking-[-0.01em] break-words sm:text-xl">
                        {title}
                    </p>
                    <p className="text-meta text-ink-secondary">
                        {listing ? `${target.providerName} · ${status}` : status}
                    </p>
                </div>
                <span className="inline-flex h-[26px] shrink-0 items-center gap-1.5 self-start rounded-sm bg-surface-sunken px-2.5 text-xs text-ink-secondary">
                    <Lock aria-hidden="true" className="size-3" strokeWidth={2} />
                    {t("contentNotice.target.prefilled")}
                </span>
            </div>

            {listing ? (
                <fieldset
                    disabled={disabled}
                    aria-labelledby={legendId}
                    className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0"
                >
                    <legend id={legendId} className={cn(LABEL_CLASS, "mb-2.5 p-0")}>
                        {t("contentNotice.target.scopeLegend")}
                    </legend>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <ScopeOption
                            value="listing"
                            field={scopeField}
                            label={t("contentNotice.target.scopeListing")}
                            description={t("contentNotice.target.scopeListingHint")}
                        />
                        <ScopeOption
                            value="provider"
                            field={scopeField}
                            label={t("contentNotice.target.scopeProvider", {
                                provider: target.providerName,
                            })}
                            description={t("contentNotice.target.scopeProviderHint")}
                        />
                    </div>
                </fieldset>
            ) : (
                <p className="flex gap-2 text-meta leading-[1.55] text-ink-secondary">
                    <Info
                        aria-hidden="true"
                        className="mt-px size-4 shrink-0 text-ink-muted"
                        strokeWidth={1.6}
                    />
                    <span>
                        {t("contentNotice.target.providerScopeNote", {
                            provider: target.providerName,
                        })}
                    </span>
                </p>
            )}
        </div>
    );
}

function ScopeOption({
    value,
    field,
    label,
    description,
}: {
    readonly value: "listing" | "provider";
    readonly field: UseFormRegisterReturn<"scope">;
    readonly label: string;
    readonly description: string;
}) {
    const descriptionId = useId();
    return (
        <label className={OPTION_CARD_CLASS}>
            <input
                type="radio"
                value={value}
                {...field}
                aria-describedby={descriptionId}
                className={RADIO_CLASS}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm leading-[1.375] font-medium">{label}</span>
                <span id={descriptionId} className="text-xs leading-normal text-ink-muted">
                    {description}
                </span>
            </span>
        </label>
    );
}
