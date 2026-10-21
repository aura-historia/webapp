import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
    ICON_BUTTON_CLASS,
    MENU_CONTENT_CLASS,
    MENU_ITEM_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";
import { cn } from "@/lib/utils.ts";

type Props = {
    readonly canDuplicate: boolean;
    readonly onEdit: () => void;
    readonly onDuplicate: () => void;
    readonly onDelete: () => void;
    readonly className?: string;
};

/** The ⋮ menu of a search filter: edit, duplicate (blocked at the plan quota) and delete. */
export function SearchFilterActionsMenu({
    canDuplicate,
    onEdit,
    onDuplicate,
    onDelete,
    className,
}: Props) {
    const { t } = useTranslation();

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                aria-label={t("searchFilters.moreActions")}
                className={cn(ICON_BUTTON_CLASS, className)}
            >
                <MoreVertical aria-hidden="true" className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                data-theme="light"
                align="end"
                sideOffset={4}
                className={MENU_CONTENT_CLASS}
            >
                <DropdownMenuItem className={MENU_ITEM_CLASS} onSelect={onEdit}>
                    <Pencil aria-hidden="true" className="size-4" strokeWidth={1.7} />
                    {t("searchFilters.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className={cn(MENU_ITEM_CLASS, "data-disabled:opacity-45")}
                    disabled={!canDuplicate}
                    onSelect={onDuplicate}
                >
                    <Copy aria-hidden="true" className="size-4" strokeWidth={1.7} />
                    {t("searchFilters.duplicate")}
                </DropdownMenuItem>
                {!canDuplicate && (
                    <p className="pr-3 pb-2 pl-[38px] text-xs leading-[1.45] text-ink-muted">
                        {t("searchFilters.createUpgradeTooltip")}
                    </p>
                )}
                <DropdownMenuSeparator className="mx-2 my-1 bg-line-subtle" />
                <DropdownMenuItem
                    className={cn(
                        MENU_ITEM_CLASS,
                        "text-oxblood focus:text-oxblood [&_svg]:text-oxblood",
                    )}
                    onSelect={onDelete}
                >
                    <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.7} />
                    {t("searchFilters.delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
