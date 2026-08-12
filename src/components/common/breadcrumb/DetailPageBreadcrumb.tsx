import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { MouseEvent } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";
import type { BreadcrumbOrigin } from "@/data/internal/common/BreadcrumbOrigin.ts";

type DetailPageBreadcrumbProps = {
    readonly title: string;
    readonly origin?: BreadcrumbOrigin;
};

export function DetailPageBreadcrumb({ title, origin }: DetailPageBreadcrumbProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // `origin.from` is a full pathname+search string captured on the origin
    // page (e.g. "/search?q=vase&sortField=PRICE"). TanStack Router's typed
    // `to` only resolves known route paths, so restoring it verbatim goes
    // through `navigate({ href })`, which parses it into pathname/search/hash.
    // Rendered as a real anchor so middle-click/open-in-new-tab still work.
    const handleOriginClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        event.preventDefault();
        navigate({ href: origin?.from });
    };

    return (
        <Breadcrumb className="mb-6">
            <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/">{t("breadcrumb.home")}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {origin && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem className="min-w-0 shrink">
                            <BreadcrumbLink
                                href={origin.from}
                                onClick={handleOriginClick}
                                className="block max-w-40 truncate sm:max-w-xs"
                            >
                                {t(`breadcrumb.${origin.fromKind}`)}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </>
                )}

                <BreadcrumbSeparator />
                <BreadcrumbItem className="min-w-0 shrink">
                    <BreadcrumbPage className="block max-w-40 truncate sm:max-w-xs">
                        {title}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
