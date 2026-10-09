import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminOAuthClientFilters } from "@/data/internal/admin/AdminOAuthClient.ts";

type FilterValues = {
    clientId: string;
    name: string;
};

export function AdminOAuthClientFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminOAuthClientFilters;
    readonly onApply: (filters: AdminOAuthClientFilters) => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FilterValues>({
        defaultValues: {
            clientId: filters.clientId ?? "",
            name: filters.name ?? "",
        },
    });

    const applyFilters = form.handleSubmit((values) => {
        onApply({
            ...(values.clientId.trim() && { clientId: values.clientId.trim() }),
            ...(values.name.trim() && { name: values.name.trim() }),
        });
    });

    const resetFilters = () => {
        form.reset({ clientId: "", name: "" });
        onApply({});
    };

    return (
        <form
            className="grid gap-3 rounded-md border bg-surface-container-low p-4"
            onSubmit={applyFilters}
        >
            <h2 className="font-medium">{t("adminOAuthClients.filters.title")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="admin-oauth-client-id-filter">
                        {t("adminOAuthClients.filters.clientId")}
                    </Label>
                    <Input
                        id="admin-oauth-client-id-filter"
                        autoComplete="off"
                        {...form.register("clientId")}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-oauth-client-name-filter">
                        {t("adminOAuthClients.filters.name")}
                    </Label>
                    <Input
                        id="admin-oauth-client-name-filter"
                        autoComplete="off"
                        {...form.register("name")}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="submit">{t("adminOAuthClients.filters.apply")}</Button>
                <Button type="button" variant="outline" onClick={resetFilters}>
                    {t("adminOAuthClients.filters.reset")}
                </Button>
            </div>
        </form>
    );
}
