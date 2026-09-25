import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

type ProductListingLinkProps = {
    readonly productListingTitleSlugId?: string;
    readonly children: ReactNode;
    readonly className?: string;
    readonly onClick?: () => void;
};

/** A hidden or redacted listing has no public detail link. */
export function ProductListingLink({
    productListingTitleSlugId,
    children,
    className,
    onClick,
}: ProductListingLinkProps) {
    if (!productListingTitleSlugId) {
        return <span className={className}>{children}</span>;
    }

    return (
        <Link
            to="/$lng/products/$productListingTitleSlugId"
            params={(current) => ({ ...current, productListingTitleSlugId })}
            className={className}
            onClick={onClick}
            from="/$lng"
        >
            {children}
        </Link>
    );
}
