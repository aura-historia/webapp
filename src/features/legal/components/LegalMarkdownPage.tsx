import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Markdown, { type Components } from "react-markdown";
import { cn } from "@/lib/utils.ts";
import { getLegalHeadingAnchor, splitLegalDocument } from "@/features/legal/lib/legalDocument.ts";

interface MarkdownPageProps {
    readonly titleKey: string;
    readonly localeMap: Record<string, string>;
}

type MarkdownProps<T extends keyof JSX.IntrinsicElements> = ComponentPropsWithoutRef<T> & {
    readonly node?: unknown;
};

const TOC_LINK_CLASS =
    "flex items-baseline gap-3 py-2 text-ink-secondary outline-none transition-colors hover:text-ink focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

export function LegalMarkdownPage({ titleKey, localeMap }: MarkdownPageProps) {
    const { t, i18n } = useTranslation();
    const { intro, body, sections } = splitLegalDocument(localeMap[i18n.language] || localeMap.en);

    const tocItems = sections.map((section) => (
        <li key={section.id} className="border-b border-line-subtle">
            <a href={`#${section.id}`} className={TOC_LINK_CLASS}>
                {section.number && (
                    <span className="w-[18px] flex-none font-mono text-tag text-ink-muted">
                        {section.number}
                    </span>
                )}
                <span>{section.title}</span>
            </a>
        </li>
    ));

    return (
        <div className="mx-auto w-full max-w-[calc(1280px+2*var(--page-gutter))] px-(--page-gutter) pt-8 pb-24 sm:pt-14 sm:pb-36">
            <header className="mb-6 flex flex-col gap-3 border-b border-line-subtle pb-6 sm:gap-4 sm:pb-9 lg:mb-14">
                <p className="font-mono text-[11px] tracking-[0.2em] text-brass-ink uppercase sm:text-eyebrow">
                    {t("legal.eyebrow")}
                </p>
                <h1 className="font-serif text-[40px] leading-[1.04] font-normal tracking-[-0.02em] text-ink sm:text-display-section">
                    {t(titleKey)}
                </h1>
                {intro && (
                    <div className="max-w-[760px] font-sans text-[17px] leading-[1.55] text-ink-secondary sm:text-lead [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-3">
                        <Markdown>{intro}</Markdown>
                    </div>
                )}
            </header>

            <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
                {sections.length > 0 && (
                    <>
                        <details className="group mb-9 rounded-panel bg-surface-raised shadow-ring lg:hidden">
                            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-panel px-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass [&::-webkit-details-marker]:hidden">
                                <span className="font-mono text-kicker text-ink uppercase">
                                    {t("legal.contents")}{" "}
                                    <span className="text-ink-muted">· {sections.length}</span>
                                </span>
                                <ChevronDown
                                    aria-hidden="true"
                                    className="size-4 text-ink-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
                                    strokeWidth={1.8}
                                />
                            </summary>
                            <nav aria-label={t("legal.contents")}>
                                <ol className="mx-4 mb-2 border-t border-line-subtle text-body-sm [&_a]:min-h-11 [&_a]:py-2.5">
                                    {tocItems}
                                </ol>
                            </nav>
                        </details>

                        <nav
                            aria-label={t("legal.contents")}
                            className="sticky top-[88px] hidden flex-col gap-3 self-start lg:flex"
                        >
                            <p className="font-mono text-kicker text-ink-muted uppercase">
                                {t("legal.contents")}
                            </p>
                            <ol className="border-t border-line-subtle text-meta">{tocItems}</ol>
                        </nav>
                    </>
                )}

                <article
                    className={cn(
                        "flex max-w-[720px] min-w-0 flex-col gap-4 font-sans text-body text-ink-secondary lg:col-start-2",
                        // The closing italic paragraph of every document is its status date.
                        "[&>p:last-child]:border-t [&>p:last-child]:border-line-subtle [&>p:last-child]:pt-4 [&>p:last-child]:font-mono [&>p:last-child]:text-kicker [&>p:last-child]:tracking-[0.14em] [&>p:last-child]:text-ink-muted [&>p:last-child]:uppercase [&>p:last-child_em]:not-italic",
                        "[&>hr+p:last-child]:border-t-0 [&>hr+p:last-child]:pt-0",
                    )}
                >
                    <Markdown components={MARKDOWN_COMPONENTS}>{body}</Markdown>
                </article>
            </div>
        </div>
    );
}

function HeadingNumber({ children }: { readonly children: ReactNode }) {
    return (
        <span className="flex-none font-mono text-[11px] tracking-[0.14em] text-brass-ink sm:text-[12px]">
            {children}
        </span>
    );
}

function textOf(children: ReactNode): string {
    if (typeof children === "string" || typeof children === "number") return String(children);
    if (Array.isArray(children)) return children.map(textOf).join("");
    return "";
}

const MARKDOWN_COMPONENTS: Components = {
    h1: ({ node, ...props }: MarkdownProps<"h2">) => <h2 {...props} />,
    h2: ({ node, children, className, ...props }: MarkdownProps<"h2">) => {
        const anchor = getLegalHeadingAnchor(textOf(children));
        return (
            <h2
                {...props}
                id={anchor.id}
                className={cn(
                    "mb-1 flex scroll-mt-24 items-baseline gap-3 font-serif text-title-md text-ink sm:mb-2 sm:text-title-lg sm:tracking-[-0.01em]",
                    className,
                )}
            >
                {anchor.number && <HeadingNumber>{anchor.number}</HeadingNumber>}
                <span>{anchor.number ? anchor.title : children}</span>
            </h2>
        );
    },
    h3: ({ node, children, className, ...props }: MarkdownProps<"h3">) => {
        const anchor = getLegalHeadingAnchor(textOf(children), false);
        return (
            <h3
                {...props}
                className={cn(
                    "mt-2 flex items-baseline gap-3 font-serif text-[22px] leading-[1.2] font-normal text-ink",
                    className,
                )}
            >
                {anchor.number && <HeadingNumber>{anchor.number}</HeadingNumber>}
                <span>{anchor.number ? anchor.title : children}</span>
            </h3>
        );
    },
    h4: ({ node, className, ...props }: MarkdownProps<"h4">) => (
        <h4 {...props} className={cn("mt-1 font-sans text-body font-medium text-ink", className)} />
    ),
    p: ({ node, className, ...props }: MarkdownProps<"p">) => (
        <p {...props} className={cn("wrap-break-word", className)} />
    ),
    a: ({ node, className, ...props }: MarkdownProps<"a">) => (
        <a
            {...props}
            className={cn(
                "underline decoration-line-strong underline-offset-3 transition-colors wrap-anywhere hover:text-brass-ink hover:decoration-current focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass",
                className,
            )}
        />
    ),
    strong: ({ node, className, ...props }: MarkdownProps<"strong">) => (
        <strong {...props} className={cn("font-medium text-ink", className)} />
    ),
    ul: ({ node, className, ...props }: MarkdownProps<"ul">) => (
        <ul {...props} className={cn("flex flex-col gap-1.5", className)} />
    ),
    li: ({ node, className, ...props }: MarkdownProps<"li">) => (
        <li
            {...props}
            className={cn(
                "relative pl-[22px] before:absolute before:top-[0.8em] before:left-1 before:h-px before:w-2 before:bg-ink-muted",
                className,
            )}
        />
    ),
    blockquote: ({ node, className, ...props }: MarkdownProps<"blockquote">) => (
        <blockquote
            {...props}
            className={cn(
                "rounded-panel bg-surface-raised p-5 text-body-sm leading-[1.7] text-ink shadow-ring sm:p-6",
                className,
            )}
        />
    ),
    hr: ({ node, className, ...props }: MarkdownProps<"hr">) => (
        <hr {...props} className={cn("my-6 border-line-subtle sm:my-9", className)} />
    ),
};
