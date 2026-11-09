import { TriangleAlert } from "lucide-react";
import { OAuthAuthorizePageContainer } from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";

interface OAuthAuthorizeErrorCardProps {
    readonly title: string;
    readonly description: string;
}

/** A terminal state shown in place of the consent card, without Authorize or Decline. */
export function OAuthAuthorizeErrorCard({ title, description }: OAuthAuthorizeErrorCardProps) {
    return (
        <OAuthAuthorizePageContainer>
            <article className="flex flex-col gap-3 rounded-card bg-surface-raised p-6 shadow-ring">
                <span
                    aria-hidden="true"
                    className="inline-flex size-9 items-center justify-center rounded-md bg-surface-sunken text-oxblood"
                >
                    <TriangleAlert className="size-[18px]" strokeWidth={1.8} />
                </span>
                <h1 className="font-serif text-[22px] leading-[1.3] font-normal text-ink">
                    {title}
                </h1>
                <p className="text-sm leading-[1.6] text-ink-secondary">{description}</p>
            </article>
        </OAuthAuthorizePageContainer>
    );
}
