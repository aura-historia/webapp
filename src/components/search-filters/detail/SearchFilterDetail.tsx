import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { ServerCrash, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H2 } from "@/components/typography/H2.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { CreateSearchFilterWizard } from "@/components/search-filters/CreateSearchFilterWizard.tsx";
import { SearchFilterMatches } from "@/components/search-filters/match/SearchFilterMatches.tsx";
import { SearchFilterConfigurationGrid } from "@/components/search-filters/SearchFilterConfigurationGrid.tsx";
import { SearchFilterDetailHeaderSkeleton } from "@/components/search-filters/detail/SearchFilterDetailHeaderSkeleton.tsx";
import { useUserSearchFilter } from "@/hooks/search-filters/useUserSearchFilter.ts";
import { useDeleteUserSearchFilter } from "@/hooks/search-filters/useDeleteUserSearchFilter.ts";

type Props = {
    readonly filterId: string;
};

export function SearchFilterDetail({ filterId }: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: filter, isPending, error } = useUserSearchFilter(filterId);
    const { mutate: deleteFilter, isPending: isDeleting } = useDeleteUserSearchFilter();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDelete = () => {
        deleteFilter(filterId, {
            onSuccess: () => {
                toast.success(t("searchFilters.deleteSuccess"));
                navigate({ to: "/me/search-filters" });
            },
            onError: (err) => toast.error(err.message),
        });
    };

    if (error) {
        return (
            <EmptyState
                icon={ServerCrash}
                title={t("searchFilters.loadingError.title")}
                description={t("searchFilters.loadingError.description")}
            />
        );
    }

    return (
        <div className="flex w-full flex-col gap-10">
            {isPending && <SearchFilterDetailHeaderSkeleton />}

            {filter && (
                <header
                    className="flex flex-col gap-6 border-b border-border/30 pb-8"
                    data-testid="section-configuration"
                >
                    <div className="flex flex-row items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tertiary">
                                {t("searchFilters.detail.eyebrow")}
                            </p>
                            <H1 className="text-ellipsis line-clamp-1">{filter.name}</H1>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                aria-label={t("searchFilters.edit")}
                                onClick={() => setEditOpen(true)}
                            >
                                <Settings2 className="size-4" />
                                <span className="hidden sm:inline">{t("searchFilters.edit")}</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2 hover:text-destructive"
                                aria-label={t("searchFilters.delete")}
                                disabled={isDeleting}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                <span className="hidden sm:inline">
                                    {t("searchFilters.delete")}
                                </span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <H2>{t("searchFilters.detail.configurationTitle")}</H2>
                        <p className="text-sm text-muted-foreground">
                            {t("searchFilters.detail.configurationHint")}
                        </p>
                    </div>

                    <SearchFilterConfigurationGrid search={filter.search} />

                    <CreateSearchFilterWizard
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        mode="edit"
                        filter={filter}
                    />

                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {t("searchFilters.deleteConfirm.title", { name: filter.name })}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("searchFilters.deleteConfirm.description")}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    {t("searchFilters.deleteConfirm.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    {t("searchFilters.deleteConfirm.confirm")}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </header>
            )}

            <SearchFilterMatches filterId={filterId} />
        </div>
    );
}
