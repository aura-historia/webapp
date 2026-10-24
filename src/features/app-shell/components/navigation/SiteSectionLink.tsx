import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { SiteSectionLink as SiteSectionLinkConfig } from "./navigationConfig.ts";

interface SiteSectionLinkProps {
    readonly link: SiteSectionLinkConfig;
    readonly isActive: boolean;
    readonly className?: string;
    readonly onClick?: () => void;
    readonly children: ReactNode;
}

/** A site section: either an anchor on the landing page or its own route. */
export function SiteSectionLink({
    link,
    isActive,
    className,
    onClick,
    children,
}: SiteSectionLinkProps) {
    if (link.kind === "landing") {
        return (
            <Link
                to="/$lng"
                hash={link.fragment}
                params={true}
                from="/$lng"
                aria-current={isActive ? "page" : undefined}
                className={className}
                onClick={onClick}
            >
                {children}
            </Link>
        );
    }

    return (
        <Link
            to={link.to}
            params={true}
            from="/$lng"
            aria-current={isActive ? "page" : undefined}
            className={className}
            onClick={onClick}
        >
            {children}
        </Link>
    );
}
