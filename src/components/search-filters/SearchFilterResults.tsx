import { useUserSearchFilters } from "@/hooks/search-filters/useUserSearchFilters.ts";
import { useDeleteUserSearchFilter } from "@/hooks/search-filters/useDeleteUserSearchFilter.ts";
import { useUserAccount } from "@/hooks/account/useUserAccount.ts";
import { SEARCH_FILTER_QUOTA } from "@/data/internal/account/SubscriptionType.ts";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, SearchX } from "lucide-react";
import { SectionInfoText } from "@/components/typography/SectionInfoText.tsx";
import { H1 } from "@/components/typography/H1.tsx";
import { H3 } from "@/components/typography/H3.tsx";
import { SearchFilterCard } from "@/components/search-filters/SearchFilterCard.tsx";
import { SearchFilterCardSkeleton } from "@/components/search-filters/SearchFilterCardSkeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { useState } from "react";
import { CreateSearchFilterWizard } from "@/components/search-filters/CreateSearchFilterWizard.tsx";
import type { UserSearchFilter } from "@/data/internal/search-filter/UserSearchFilter.ts";

const SKELETON_IDS = ["s1", "s2", "s3", "s4"] as const;

export function SearchFilterResults() {
    const { t } = useTranslation();
    const { data, isPending, error } = useUserSearchFilters();
    const { mutate: deleteFilter, isPending: isDeleting } = useDeleteUserSearchFilter();
    const { data: account, isPending: isAccountPending } = useUserAccount();
    const [query, setQuery] = useState("");
    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardMode, setWizardMode] = useState<"create" | "edit" | "duplicate">("create");
    const [editFilter, setEditFilter] = useState<UserSearchFilter | undefined>(undefined);

    const canCreate =
        !isAccountPending &&
        !isPending &&
        account != null &&
        (data?.total ?? data?.size ?? 0) < SEARCH_FILTER_QUOTA[account.subscriptionType];

    const items = data?.items ?? [];
    const filtered = query.trim()
        ? items.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
        : items;

    const handleDelete = (id: string) => {
        deleteFilter(id, {
            onSuccess: () => toast.success(t("searchFilters.deleteSuccess")),
            onError: (err) => toast.error(err.message),
        });
    };

    if (isPending) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {SKELETON_IDS.map((id) => (
                    <SearchFilterCardSkeleton key={id} />
                ))}
            </div>
        );
    }

    if (error) return <SectionInfoText>{t("searchFilters.loadingError")}</SectionInfoText>;
    if (!data) return null;

    return (
        <div className="flex flex-col w-full gap-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <H1>{t("searchFilters.title")}</H1>
                    <span className="text-base text-muted-foreground">
                        {t("searchFilters.totalElements", { count: data.total ?? data.size })}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Input
                        placeholder={t("searchFilters.searchPlaceholder")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full sm:w-80"
                    />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        size="sm"
                                        className="gap-2 shrink-0"
                                        disabled={!canCreate}
                                        onClick={() => {
                                            setWizardMode("create");
                                            setEditFilter(undefined);
                                            setWizardOpen(true);
                                        }}
                                    >
                                        <Plus className="size-4" />
                                        {t("searchFilters.create")}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!canCreate && !isAccountPending && (
                                <TooltipContent>
                                    {t("searchFilters.createUpgradeTooltip")}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <CreateSearchFilterWizard
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                mode={wizardMode}
                filter={editFilter}
            />

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16">
                    <SearchX className="size-16 text-muted-foreground" />
                    <div className="text-center space-y-2">
                        <H3>{t("searchFilters.noResults.title")}</H3>
                        <p className="text-base text-muted-foreground">
                            {t("searchFilters.noResults.description")}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((filter) => (
                        <SearchFilterCard
                            key={filter.id}
                            filter={filter}
                            onDelete={handleDelete}
                            canDuplicate={canCreate}
                            onEdit={(f) => {
                                setWizardMode("edit");
                                setEditFilter(f);
                                setWizardOpen(true);
                            }}
                            onDuplicate={(f) => {
                                setWizardMode("duplicate");
                                setEditFilter(f);
                                setWizardOpen(true);
                            }}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
