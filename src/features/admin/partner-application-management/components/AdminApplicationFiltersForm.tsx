import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    type AdminApplicationFilters,
    type AdminApplicationSortField,
    type AdminApplicationSortOrder,
    PARTNERSHIP_PROPOSAL_TYPES,
} from "@/data/internal/partner-application/AdminPartnershipApplication.ts";
import { PARTNER_APPLICATION_STATES } from "@/data/internal/partner-application/OwnPartnershipApplication.ts";
import {
    ADMIN_APPLICATION_STATE_TRANSLATION_KEY,
    PROPOSAL_TYPE_TRANSLATION_KEY,
} from "../lib/adminApplicationPresentation.ts";

const SORT_OPTIONS = [
    "created:desc",
    "created:asc",
    "updated:desc",
    "updated:asc",
] as const satisfies readonly `${AdminApplicationSortField}:${AdminApplicationSortOrder}`[];
type SortOption = (typeof SORT_OPTIONS)[number];

function toggle<T>(values: readonly T[] | undefined, value: T, checked: boolean): T[] {
    const rest = (values ?? []).filter((item) => item !== value);
    return checked ? [...rest, value] : rest;
}

function cleanFilters(filters: AdminApplicationFilters): AdminApplicationFilters {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) =>
            Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim(),
        ),
    ) as AdminApplicationFilters;
}

export function AdminApplicationFiltersForm({
    filters,
    onApply,
}: {
    readonly filters: AdminApplicationFilters;
    readonly onApply: (filters: AdminApplicationFilters) => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<AdminApplicationFilters>(filters);
    const update = (patch: Partial<AdminApplicationFilters>) =>
        setDraft((current) => ({ ...current, ...patch }));
    const sortValue: SortOption = `${draft.sort ?? "created"}:${draft.order ?? "desc"}`;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        onApply(cleanFilters(draft));
    };

    return (
        <form
            onSubmit={submit}
            className="grid gap-4 border bg-surface-container-low p-4"
            aria-label={t("adminApplications.filters.title")}
        >
            <div className="grid gap-4 md:grid-cols-2">
                <fieldset className="grid gap-2">
                    <legend className="mb-2 text-sm font-medium">
                        {t("adminApplications.filters.states")}
                    </legend>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {PARTNER_APPLICATION_STATES.map((state) => (
                            <Label key={state} className="font-normal">
                                <Checkbox
                                    checked={draft.states?.includes(state) ?? false}
                                    onCheckedChange={(checked) =>
                                        update({
                                            states: toggle(draft.states, state, checked === true),
                                        })
                                    }
                                />
                                {t(ADMIN_APPLICATION_STATE_TRANSLATION_KEY[state])}
                            </Label>
                        ))}
                    </div>
                </fieldset>
                <fieldset className="grid gap-2">
                    <legend className="mb-2 text-sm font-medium">
                        {t("adminApplications.filters.proposalTypes")}
                    </legend>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {PARTNERSHIP_PROPOSAL_TYPES.map((type) => (
                            <Label key={type} className="font-normal">
                                <Checkbox
                                    checked={draft.proposalTypes?.includes(type) ?? false}
                                    onCheckedChange={(checked) =>
                                        update({
                                            proposalTypes: toggle(
                                                draft.proposalTypes,
                                                type,
                                                checked === true,
                                            ),
                                        })
                                    }
                                />
                                {t(PROPOSAL_TYPE_TRANSLATION_KEY[type])}
                            </Label>
                        ))}
                    </div>
                </fieldset>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="admin-applications-applicant">
                        {t("adminApplications.filters.applicantUserId")}
                    </Label>
                    <Input
                        id="admin-applications-applicant"
                        value={draft.applicantUserId ?? ""}
                        onChange={(event) => update({ applicantUserId: event.target.value })}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-applications-source">
                        {t("adminApplications.filters.listingSourceId")}
                    </Label>
                    <Input
                        id="admin-applications-source"
                        value={draft.sourceId ?? ""}
                        onChange={(event) => update({ sourceId: event.target.value })}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(
                    [
                        ["createdFrom", "admin-applications-created-from"],
                        ["createdTo", "admin-applications-created-to"],
                        ["updatedFrom", "admin-applications-updated-from"],
                        ["updatedTo", "admin-applications-updated-to"],
                    ] as const
                ).map(([key, id]) => (
                    <div key={key} className="grid gap-2">
                        <Label htmlFor={id}>{t(`adminApplications.filters.${key}`)}</Label>
                        <Input
                            id={id}
                            type="date"
                            value={draft[key] ?? ""}
                            onChange={(event) => update({ [key]: event.target.value })}
                        />
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid gap-2">
                    <Label htmlFor="admin-applications-sort">
                        {t("adminApplications.filters.sort")}
                    </Label>
                    <Select
                        value={sortValue}
                        onValueChange={(value) => {
                            const [sort, order] = value.split(":") as [
                                AdminApplicationSortField,
                                AdminApplicationSortOrder,
                            ];
                            update({ sort, order });
                        }}
                    >
                        <SelectTrigger id="admin-applications-sort" className="min-w-56">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {t(`adminApplications.sort.${option.replace(":", "_")}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setDraft({});
                            onApply({});
                        }}
                    >
                        {t("adminApplications.filters.reset")}
                    </Button>
                    <Button type="submit">{t("adminApplications.filters.apply")}</Button>
                </div>
            </div>
        </form>
    );
}
