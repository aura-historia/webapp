import { Trans, useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { HEADLINE_COMPONENTS } from "@/features/landing/components/common/SectionHeading.tsx";
import { useDeleteAllNotifications } from "@/features/notification-center/api/useDeleteAllNotifications.ts";
import {
    DANGER_PILL_CLASS,
    SECONDARY_PILL_CLASS,
} from "@/features/saved-searches/lib/searchFilterStyles.ts";

type Props = {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
};

/** Confirms deleting every notification; it stays open and locked until the request finishes. */
export function DeleteAllNotificationsDialog({ open, onOpenChange }: Props) {
    const { t } = useTranslation();
    const { mutate: deleteAll, isPending } = useDeleteAllNotifications();

    const handleDelete = () => deleteAll(undefined, { onSuccess: () => onOpenChange(false) });

    return (
        <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
            <DialogContent
                role="alertdialog"
                showCloseButton={false}
                className="gap-5 rounded-panel border-0 bg-surface-raised p-7 text-ink shadow-menu sm:max-w-[460px]"
            >
                <DialogHeader className="gap-2 text-left">
                    <DialogTitle className="font-serif text-[26px] leading-[1.15] font-normal [&_em]:italic">
                        <Trans
                            i18nKey="notifications.deleteAllConfirm.title"
                            components={HEADLINE_COMPONENTS}
                        />
                    </DialogTitle>
                    <DialogDescription className="text-body text-ink-secondary">
                        {t("notifications.deleteAllConfirm.description")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row flex-wrap justify-end gap-2.5 sm:justify-end">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className={SECONDARY_PILL_CLASS}
                    >
                        {t("notifications.deleteAllConfirm.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className={DANGER_PILL_CLASS}
                    >
                        {isPending && <Spinner aria-hidden="true" />}
                        {isPending
                            ? t("notifications.deleteAllConfirm.deleting")
                            : t("notifications.deleteAll")}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
