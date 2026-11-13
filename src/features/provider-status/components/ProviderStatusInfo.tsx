import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import type { ProviderStatusScope } from "@/features/provider-status/lib/providerStatusLinks.ts";
import { useMediaQuery } from "@/hooks/common/useMediaQuery.ts";
import { cn } from "@/lib/utils.ts";

const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";
const LINK_CLASS = cn(
    "text-ink underline decoration-line-strong underline-offset-3 transition-colors hover:text-oxblood hover:decoration-oxblood",
    FOCUS_CLASS,
);
const EYEBROW_CLASS =
    "font-mono text-[11px] leading-[1.4] tracking-[0.14em] text-ink-muted uppercase";

type ProviderStatusInfoProps = {
    readonly scope: ProviderStatusScope;
    readonly providerName: string;
    /** The provider's canonical address, linked as the place the content was found. */
    readonly sourceUrl?: string;
    readonly sourceHost?: string;
    readonly removalHref: string;
};

type FactsProps = Omit<ProviderStatusInfoProps, "removalHref"> & { readonly mobile: boolean };

function ProviderStatusFacts({ scope, providerName, sourceUrl, sourceHost, mobile }: FactsProps) {
    const { t } = useTranslation();
    const facts: { key: string; content: React.ReactNode }[] = [
        {
            key: "independent",
            content: t("providerStatus.info.facts.independent", { provider: providerName }),
        },
    ];
    if (sourceUrl && sourceHost) {
        facts.push({
            key: "found",
            content: (
                <Trans
                    i18nKey={
                        scope === "provider"
                            ? "providerStatus.info.facts.foundProvider"
                            : "providerStatus.info.facts.foundListing"
                    }
                    values={{ host: sourceHost }}
                    components={{
                        // The host is also the link's own content; Trans puts the same text in.
                        site: (
                            <a
                                href={sourceUrl}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                className={LINK_CLASS}
                            >
                                {sourceHost}
                            </a>
                        ),
                    }}
                />
            ),
        });
    }
    for (const key of ["rights", "translation", "images", "price", "contract", "noChecks"]) {
        facts.push({ key, content: t(`providerStatus.info.facts.${key}`) });
    }

    return (
        <ul className="flex flex-col border-t border-line-subtle">
            {facts.map((fact) => (
                <li
                    key={fact.key}
                    data-testid={`provider-status-fact-${fact.key}`}
                    className={cn(
                        "flex gap-2.5 border-b border-line-subtle leading-normal text-ink-secondary",
                        mobile ? "py-2.5 text-body-sm" : "py-[9px] text-meta",
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={cn(
                            "size-1 shrink-0 rounded-pill bg-ink-muted",
                            mobile ? "mt-[9px]" : "mt-2",
                        )}
                    />
                    <span>{fact.content}</span>
                </li>
            ))}
        </ul>
    );
}

/**
 * The ⓘ beside the non-partner notice: what Aura Historia does and does not do with a provider it
 * is not partnered with. A popover anchored to the ⓘ from 768px, a bottom sheet below. Both close
 * on Esc, the close button or a click outside and return focus to the ⓘ.
 */
export function ProviderStatusInfo(props: ProviderStatusInfoProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const desktop = useMediaQuery("(min-width: 768px)");
    const heading =
        props.scope === "provider"
            ? t("providerStatus.info.headingProvider")
            : t("providerStatus.info.headingListing");
    const removalLabel =
        props.scope === "provider"
            ? t("providerStatus.info.removeAll")
            : t("providerStatus.info.removeListing");

    const trigger = (
        <button
            type="button"
            aria-label={heading}
            aria-expanded={open}
            data-testid="provider-status-info-trigger"
            onClick={desktop ? undefined : () => setOpen(true)}
            className={cn(
                "group -m-[11px] inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill",
                FOCUS_CLASS,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "inline-flex size-[22px] items-center justify-center rounded-pill transition-colors duration-150 ease-out motion-reduce:transition-none",
                    open
                        ? "bg-ink text-surface shadow-[inset_0_0_0_1.25px_var(--color-ink)]"
                        : "text-ink shadow-[inset_0_0_0_1.25px_var(--color-line-strong)] group-hover:bg-ink group-hover:text-surface",
                )}
            >
                <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                >
                    <path d="M6 5.4V9" />
                    <circle cx="6" cy="3.1" r="0.55" fill="currentColor" stroke="none" />
                </svg>
            </span>
        </button>
    );

    if (desktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>{trigger}</PopoverTrigger>
                <PopoverContent
                    align="start"
                    sideOffset={10}
                    collisionPadding={16}
                    aria-labelledby="provider-status-info-title"
                    className="flex max-h-(--radix-popover-content-available-height) w-[392px] flex-col gap-4 overflow-y-auto p-5 pb-[18px]"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1.5">
                            <span className={EYEBROW_CLASS}>
                                {t("providerStatus.info.eyebrow")}
                            </span>
                            <h2
                                id="provider-status-info-title"
                                className="font-serif text-[22px] leading-[1.2] font-normal tracking-[-0.01em]"
                            >
                                {heading}
                            </h2>
                        </div>
                        <button
                            type="button"
                            aria-label={t("providerStatus.info.close")}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "-mt-1.5 -mr-2 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken",
                                FOCUS_CLASS,
                            )}
                        >
                            <X aria-hidden="true" className="size-4" strokeWidth={1.8} />
                        </button>
                    </div>
                    <ProviderStatusFacts {...props} mobile={false} />
                    <p className="text-meta leading-[1.6] text-ink-muted">
                        {t("providerStatus.info.providerQuestion")}{" "}
                        <a href={props.removalHref} className={LINK_CLASS}>
                            {removalLabel}
                        </a>{" "}
                        ·{" "}
                        <Link
                            to="/$lng/partner-program"
                            params={true}
                            from="/$lng"
                            className={LINK_CLASS}
                        >
                            {t("providerStatus.info.becomePartner")}
                        </Link>
                    </p>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <>
            {trigger}
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent className="rounded-t-[20px] border-0 bg-surface-raised shadow-menu">
                    <div className="flex flex-col gap-4 overflow-y-auto px-5 pt-2.5 pb-7">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1.5 pt-1.5">
                                <span className={EYEBROW_CLASS}>
                                    {t("providerStatus.info.eyebrow")}
                                </span>
                                <DrawerTitle className="font-serif text-[24px] leading-[1.2] font-normal tracking-[-0.01em] text-ink">
                                    {heading}
                                </DrawerTitle>
                                <DrawerDescription className="sr-only">
                                    {t("providerStatus.info.facts.independent", {
                                        provider: props.providerName,
                                    })}
                                </DrawerDescription>
                            </div>
                            <button
                                type="button"
                                aria-label={t("providerStatus.info.close")}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "-mr-2.5 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken",
                                    FOCUS_CLASS,
                                )}
                            >
                                <X aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                            </button>
                        </div>
                        <ProviderStatusFacts {...props} mobile />
                        <div className="flex flex-col gap-2.5">
                            <span className={EYEBROW_CLASS}>
                                {t("providerStatus.info.providerQuestion")}
                            </span>
                            <a
                                href={props.removalHref}
                                className={cn(
                                    "inline-flex min-h-12 items-center justify-center rounded-pill px-4 text-center text-button text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
                                    FOCUS_CLASS,
                                )}
                            >
                                {removalLabel}
                            </a>
                            <Link
                                to="/$lng/partner-program"
                                params={true}
                                from="/$lng"
                                className={cn(
                                    "inline-flex h-12 items-center justify-center rounded-pill bg-ink text-button text-surface",
                                    FOCUS_CLASS,
                                )}
                            >
                                {t("providerStatus.info.becomePartner")}
                            </Link>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
