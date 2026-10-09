import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import type { AdminPartnershipFilters } from "@/data/internal/partnership/AdminPartnership.ts";

type FilterFormValues = {
    partyId: string;
    memberUserId: string;
    listingSourceId: string;
};

const EMPTY_FILTERS: FilterFormValues = {
    partyId: "",
    memberUserId: "",
    listingSourceId: "",
};

export function AdminPartnershipFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminPartnershipFilters;
    readonly onApply: (filters: AdminPartnershipFilters) => void;
}) {
    const { t } = useTranslation();
    const schema = z.object({
        partyId: z.string().trim().max(128, t("adminPartnerships.validation.idTooLong")),
        memberUserId: z.string().trim().max(128, t("adminPartnerships.validation.idTooLong")),
        listingSourceId: z.string().trim().max(128, t("adminPartnerships.validation.idTooLong")),
    });
    const form = useForm<FilterFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            ...EMPTY_FILTERS,
            partyId: filters.partyId ?? "",
            memberUserId: filters.memberUserId ?? "",
            listingSourceId: filters.listingSourceId ?? "",
        },
    });

    const apply = form.handleSubmit((values) => {
        onApply(
            Object.fromEntries(
                Object.entries(values).filter(([, value]) => value.length > 0),
            ) as AdminPartnershipFilters,
        );
    });

    const reset = () => {
        form.reset(EMPTY_FILTERS);
        onApply({});
    };

    const fields = [
        ["partyId", "admin-partnerships-party-id", "partyId"],
        ["memberUserId", "admin-partnerships-member-user-id", "memberUserId"],
        ["listingSourceId", "admin-partnerships-listing-source-id", "listingSourceId"],
    ] as const;

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                void apply();
            }}
            className="grid gap-4 border bg-surface-container-low p-4"
            aria-label={t("adminPartnerships.filters.title")}
        >
            <div className="grid gap-4 md:grid-cols-3">
                {fields.map(([name, id, translationKey]) => (
                    <div key={name} className="grid gap-2">
                        <Label htmlFor={id}>
                            {t(`adminPartnerships.filters.${translationKey}`)}
                        </Label>
                        <Input
                            id={id}
                            {...form.register(name)}
                            autoComplete="off"
                            spellCheck={false}
                            aria-invalid={Boolean(form.formState.errors[name])}
                            aria-describedby={
                                form.formState.errors[name] ? `${id}-error` : undefined
                            }
                        />
                        {form.formState.errors[name] && (
                            <p id={`${id}-error`} className="text-sm text-destructive">
                                {form.formState.errors[name]?.message}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={reset}>
                    {t("adminPartnerships.filters.reset")}
                </Button>
                <Button type="submit">{t("adminPartnerships.filters.apply")}</Button>
            </div>
        </form>
    );
}
