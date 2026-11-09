import { OAuthAuthorizeTitle } from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";
import { CONSENT_CARD_CLASS } from "@/features/oauth/lib/oauthConsentStyles.ts";

interface OAuthAuthorizePageSkeletonProps {
    readonly requestedScopes: readonly string[];
    readonly title: string;
}

const BAR = "rounded-xs bg-surface-sunken motion-safe:animate-pulse";

/** The consent card's blocks as bars, in the same column (board state "D · Loading"). */
export function OAuthAuthorizePageSkeleton({
    requestedScopes,
    title,
}: OAuthAuthorizePageSkeletonProps) {
    return (
        <>
            <OAuthAuthorizeTitle>{title}</OAuthAuthorizeTitle>
            <div className={CONSENT_CARD_CLASS} aria-busy="true">
                <div className="flex items-start gap-4">
                    <div className={`${BAR} size-16 shrink-0 rounded-md`} />
                    <div className="flex flex-1 flex-col gap-3 pt-1">
                        <div className={`${BAR} h-6 w-[72%]`} />
                        <div className={`${BAR} h-3 w-[52%] opacity-70`} />
                    </div>
                </div>

                <div className="flex flex-col gap-2.5">
                    <div className={`${BAR} h-3.5`} />
                    <div className={`${BAR} h-3.5 w-[94%]`} />
                    <div className={`${BAR} h-3.5 w-[58%]`} />
                </div>

                {requestedScopes.length > 0 && (
                    <ul>
                        {requestedScopes.map((scope) => (
                            <li
                                key={scope}
                                className="flex flex-col gap-2 border-t border-line py-3.5 last:border-b"
                            >
                                <div className={`${BAR} h-3.5 w-[46%]`} />
                                <div className={`${BAR} h-3 w-[86%] opacity-70`} />
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex flex-col gap-3 border-t border-line-subtle pt-6 sm:flex-row-reverse">
                    <div className={`${BAR} h-12 rounded-pill sm:w-32`} />
                    <div className={`${BAR} h-12 rounded-pill opacity-70 sm:w-28`} />
                </div>
            </div>
        </>
    );
}
