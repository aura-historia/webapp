import type { ReactNode } from "react";

interface AccountSectionProps {
    readonly id: string;
    readonly title: string;
    readonly description?: string;
    readonly children: ReactNode;
}

/** One row of the account page: serif title and short description beside the section's card. */
export function AccountSection({ id, title, description, children }: AccountSectionProps) {
    const headingId = `${id}-heading`;

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className="flex scroll-mt-24 flex-col gap-4 border-b border-line-subtle py-9 last:border-b-0 last:pb-0 lg:flex-row lg:items-start lg:gap-14 lg:py-14"
        >
            <div className="flex flex-col gap-2 lg:max-w-[340px] lg:flex-[1_1_260px] lg:gap-3">
                <h2
                    id={headingId}
                    className="font-serif text-title-md font-normal lg:text-[30px] lg:leading-[1.12] lg:tracking-[-0.01em]"
                >
                    {title}
                </h2>
                {description && <p className="text-body-sm text-ink-secondary">{description}</p>}
            </div>
            <div className="min-w-0 lg:flex-[999_1_560px]">{children}</div>
        </section>
    );
}
