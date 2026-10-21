import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useDeleteUserSearchFilter } from "@/features/saved-searches/api/useDeleteUserSearchFilter.ts";
import {
    DANGER_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";

type Props = {
    readonly filterId: string;
    readonly filterName: string;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onDeleted?: () => void;
};

/** Confirms deleting a search filter; it stays open and locked until the request finishes. */
export function DeleteSearchFilterDialog({
    filterId,
    filterName,
    open,
    onOpenChange,
    onDeleted,
}: Props) {
    const { t } = useTranslation();
    const { mutate: deleteFilter, isPending } = useDeleteUserSearchFilter();

    const handleDelete = () =>
        deleteFilter(filterId, {
            onSuccess: () => {
                toast.success(t("searchFilters.deleteSuccess"));
                onOpenChange(false);
                onDeleted?.();
            },
            onError: (err) => toast.error(err.message),
        });

    return (
        <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
            <DialogContent
                role="alertdialog"
                showCloseButton={false}
                className="gap-5 rounded-panel border-0 bg-surface-raised p-7 text-ink shadow-menu sm:max-w-[460px]"
            >
                <DialogHeader className="gap-2 text-left">
                    <DialogTitle className="font-serif text-[24px] leading-[1.2] font-normal">
                        {t("searchFilters.deleteConfirm.title", { name: filterName })}
                    </DialogTitle>
                    <DialogDescription className="text-body-sm text-ink-secondary">
                        {t("searchFilters.deleteConfirm.description")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row flex-wrap justify-end gap-2.5 sm:justify-end">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className={SECONDARY_PILL_CLASS}
                    >
                        {t("searchFilters.deleteConfirm.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className={DANGER_PILL_CLASS}
                    >
                        {isPending && <Spinner aria-hidden="true" />}
                        {t("searchFilters.deleteConfirm.confirm")}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
