import { Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FOOTER_GROUPS,
    type FooterGroup,
    type FooterLink as FooterLinkConfig,
    SOCIAL_LINKS,
} from "@/features/app-shell/components/footer/Footer.data.ts";
import { LocaleSwitch } from "@/features/app-shell/components/navigation/LocaleSwitch.tsx";
import {
    CONTACT_EMAIL,
    NAV_FOCUS_CLASS,
} from "@/features/app-shell/components/navigation/navigationConfig.ts";
import { Wordmark } from "@/features/app-shell/components/navigation/Wordmark.tsx";
import { cn } from "@/lib/utils.ts";

const LINK_CLASS = cn("rounded-xs transition-colors hover:text-brass", NAV_FOCUS_CLASS);

function FooterLink({ link }: { readonly link: FooterLinkConfig }) {
    const { t } = useTranslation();
    const className = cn(LINK_CLASS, "flex min-h-10 items-center md:inline-flex md:min-h-0");

    if (link.kind === "landing") {
        return (
            <Link
                to="/$lng"
                hash={link.fragment}
                resetScroll={false}
                params={true}
                from="/$lng"
                className={className}
            >
                {t(link.translationKey)}
            </Link>
        );
    }

    if (link.kind === "external") {
        return (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                {t(link.translationKey)}
            </a>
        );
    }

    return (
        <Link to={link.to} params={true} from="/$lng" className={className}>
            {t(link.translationKey)}
        </Link>
    );
}

/**
 * A link group: a `+` / `−` disclosure on phones, an always-open column from 768px.
 * One list serves both layouts so no link is rendered twice.
 */
function FooterLinkGroup({
    group,
    isOpen,
    onToggle,
}: {
    readonly group: FooterGroup;
    readonly isOpen: boolean;
    readonly onToggle: () => void;
}) {
    const { t } = useTranslation();
    const panelId = useId();
    const title = t(group.titleKey);

    return (
        <nav aria-label={title} className="border-b border-line md:border-0">
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={onToggle}
                className={cn(
                    "flex min-h-14 w-full cursor-pointer items-center justify-between font-mono text-eyebrow tracking-[0.16em] text-ink uppercase md:hidden",
                    NAV_FOCUS_CLASS,
                )}
            >
                {title}
                <span aria-hidden="true" className="font-sans text-xl font-light tracking-normal">
                    {isOpen ? "−" : "+"}
                </span>
            </button>
            <span
                aria-hidden="true"
                className="mb-1 hidden font-mono text-kicker text-ink-muted uppercase md:block"
            >
                {title}
            </span>
            <ul
                id={panelId}
                className={cn(
                    "grid-cols-2 gap-x-4 gap-y-1 pb-[18px] text-[15px] md:mt-3 md:flex md:flex-col md:gap-3 md:pb-0 md:text-body-sm",
                    isOpen ? "grid" : "hidden",
                )}
            >
                {group.links.map((link) => (
                    <li key={link.translationKey}>
                        <FooterLink link={link} />
                    </li>
                ))}
            </ul>
        </nav>
    );
}

/** The site footer on the ink ground. */
export function Footer() {
    const { t } = useTranslation();
    const [openGroup, setOpenGroup] = useState<FooterGroup["id"] | null>(null);

    return (
        <footer
            data-theme="dark"
            className="bg-surface px-(--page-gutter) pt-14 pb-8 text-ink-secondary md:pt-20"
        >
            <div className="mx-auto flex max-w-content flex-col gap-8 md:gap-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-10">
                    <div className="flex flex-col gap-3.5 md:gap-[18px]">
                        <Link
                            to="/$lng"
                            params={true}
                            from="/$lng"
                            aria-label={t("header.home")}
                            className={cn("self-start text-ink", LINK_CLASS)}
                        >
                            <Wordmark
                                label={t("header.wordmark")}
                                className="h-[38px] md:h-[41px]"
                            />
                        </Link>
                        <p className="max-w-[260px] text-body-sm">{t("footer.tagline")}</p>
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className={cn(
                                "inline-flex min-h-8 items-center self-start text-body-sm text-ink",
                                LINK_CLASS,
                            )}
                        >
                            {CONTACT_EMAIL}
                        </a>
                    </div>

                    <div className="border-t border-line md:contents">
                        {FOOTER_GROUPS.map((group) => (
                            <FooterLinkGroup
                                key={group.id}
                                group={group}
                                isOpen={openGroup === group.id}
                                onToggle={() =>
                                    setOpenGroup((current) =>
                                        current === group.id ? null : group.id,
                                    )
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3.5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-5 md:border-t md:border-line md:pt-6">
                    <p className="order-last text-meta md:order-first">
                        {t("footer.copyright", { year: new Date().getFullYear() })}
                    </p>
                    <nav aria-label={t("footer.socialNavigation")}>
                        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-body-sm md:text-meta">
                            {SOCIAL_LINKS.map((social) => (
                                <li key={social.name}>
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "inline-flex min-h-9 items-center md:min-h-0",
                                            LINK_CLASS,
                                        )}
                                    >
                                        {social.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <LocaleSwitch
                        variant="responsive"
                        className="border-t border-line pt-5 md:border-0 md:pt-0"
                    />
                </div>
            </div>
        </footer>
    );
}
