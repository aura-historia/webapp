import { ArrowUpRight, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LinkedInIcon } from "@/components/icons/SocialIcons.tsx";
import type { AboutTeamMember } from "@/features/about/config/aboutPage.data";

const CONTACT_BUTTON_CLASS =
    "inline-flex h-10 items-center gap-2 rounded-pill px-4 text-meta font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] outline-none transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

type AboutTeamMemberCardProps = {
    readonly member: AboutTeamMember;
};

export function AboutTeamMemberCard({ member }: AboutTeamMemberCardProps) {
    const { t } = useTranslation();

    return (
        <article className="flex h-full flex-col gap-5 rounded-card bg-surface-raised p-6 text-ink shadow-ring sm:p-7">
            <div className="flex items-center gap-4">
                {member.imageUrl ? (
                    <img
                        src={member.imageUrl}
                        alt={t("aboutPage.team.imageAlt", {
                            name: member.name,
                        })}
                        className="size-16 shrink-0 rounded-full bg-image-ground object-cover shadow-ring"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div
                        className="flex size-16 shrink-0 items-center justify-center rounded-full bg-oxblood font-serif text-2xl tracking-[0.02em] text-on-oxblood"
                        aria-label={t("aboutPage.team.initialsFallback", {
                            name: member.name,
                        })}
                        role="img"
                    >
                        {getInitials(member.name)}
                    </div>
                )}
                <div className="flex min-w-0 flex-col gap-1.5">
                    <h3 className="font-serif text-title-md font-normal">{member.name}</h3>
                    <p className="font-mono text-kicker text-ink-muted uppercase">
                        {t(member.positionKey)}
                    </p>
                </div>
            </div>
            {member.bioKey && <p className="text-body text-ink-secondary">{t(member.bioKey)}</p>}
            <div className="mt-auto flex flex-wrap gap-2 border-t border-line-subtle pt-4">
                <a
                    href={`mailto:${member.email}`}
                    aria-label={t("aboutPage.team.emailAria", {
                        name: member.name,
                    })}
                    className={CONTACT_BUTTON_CLASS}
                >
                    <Mail className="size-[15px]" strokeWidth={1.8} aria-hidden="true" />
                    {t("aboutPage.team.email")}
                </a>
                <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("aboutPage.team.linkedinAria", {
                        name: member.name,
                    })}
                    className={CONTACT_BUTTON_CLASS}
                >
                    <LinkedInIcon className="size-[15px]" />
                    {t("aboutPage.team.linkedin")}
                    <ArrowUpRight className="size-[13px]" strokeWidth={1.8} aria-hidden="true" />
                </a>
            </div>
        </article>
    );
}
