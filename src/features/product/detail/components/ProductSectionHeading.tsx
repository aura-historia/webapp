export function ProductSectionHeading({
    title,
    eyebrow,
    id,
}: {
    readonly title: string;
    /** Mono kicker above the title, such as the provider's name. */
    readonly eyebrow?: string;
    readonly id?: string;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2.5 sm:gap-3">
            {eyebrow && (
                <span className="font-mono text-[11px] leading-[1.4] tracking-[0.2em] text-brass-ink uppercase sm:text-eyebrow">
                    {eyebrow}
                </span>
            )}
            <h2
                id={id}
                className="font-serif text-title-md font-normal sm:text-[32px] sm:leading-[1.1] sm:tracking-[-0.01em]"
            >
                {title}
            </h2>
        </div>
    );
}
