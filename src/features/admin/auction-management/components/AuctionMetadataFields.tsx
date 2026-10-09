import { useController, type UseFormRegisterReturn, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import type { AuctionMetadataValues } from "../api/useAdminAuctions.ts";
import { AUCTION_NAME_LANGUAGES } from "../lib/auctionForm.ts";

const FORMATS = ["LIVE", "TIMED"] as const;
const REPORTED_STATUSES = ["SCHEDULED", "IN_PROGRESS", "ENDED", "POSTPONED", "CANCELLED"] as const;

export function AuctionMetadataFields({
    form,
}: {
    readonly form: UseFormReturn<AuctionMetadataValues>;
}) {
    const { t } = useTranslation();
    const format = useController({ control: form.control, name: "format" }).field;
    const status = useController({ control: form.control, name: "reportedStatus" }).field;
    const language = useController({ control: form.control, name: "nameLanguage" }).field;

    return (
        <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="auction-name">{t("adminAuctions.fields.name")}</Label>
                    <Input id="auction-name" autoComplete="off" {...form.register("name")} />
                    <FieldError message={form.formState.errors.name?.message} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="auction-name-language">
                        {t("adminAuctions.fields.nameLanguage")}
                    </Label>
                    <Select value={language.value} onValueChange={language.onChange}>
                        <SelectTrigger id="auction-name-language">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AUCTION_NAME_LANGUAGES.map((code) => (
                                <SelectItem key={code} value={code}>
                                    {code.toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="auction-catalogue-url">
                        {t("adminAuctions.fields.catalogueUrl")}
                    </Label>
                    <Input
                        id="auction-catalogue-url"
                        type="url"
                        inputMode="url"
                        autoComplete="url"
                        {...form.register("catalogueUrl")}
                    />
                    <FieldError message={form.formState.errors.catalogueUrl?.message} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="auction-format">{t("adminAuctions.fields.format")}</Label>
                    <Select
                        value={format.value || "unset"}
                        onValueChange={(value) => format.onChange(value === "unset" ? "" : value)}
                    >
                        <SelectTrigger id="auction-format">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unset">
                                {t("adminAuctions.fields.notSet")}
                            </SelectItem>
                            {FORMATS.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {t(`adminAuctions.formats.${value}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="auction-reported-status">
                        {t("adminAuctions.fields.reportedStatus")}
                    </Label>
                    <Select
                        value={status.value || "unset"}
                        onValueChange={(value) => status.onChange(value === "unset" ? "" : value)}
                    >
                        <SelectTrigger id="auction-reported-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unset">
                                {t("adminAuctions.fields.notSet")}
                            </SelectItem>
                            {REPORTED_STATUSES.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {t(`adminAuctions.reportedStatuses.${value}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="auction-reported-lot-count">
                        {t("adminAuctions.fields.reportedLotCount")}
                    </Label>
                    <Input
                        id="auction-reported-lot-count"
                        type="number"
                        min={0}
                        max={4_294_967_295}
                        step={1}
                        inputMode="numeric"
                        {...form.register("reportedLotCount")}
                    />
                    <FieldError message={form.formState.errors.reportedLotCount?.message} />
                </div>
            </div>

            <fieldset className="grid gap-3 border p-4">
                <legend className="px-1 font-medium">{t("adminAuctions.fields.schedule")}</legend>
                <p className="text-sm text-muted-foreground">
                    {t("adminAuctions.fields.scheduleHelp")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <UtcDateTimeField
                        id="auction-bidding-opens"
                        label={t("adminAuctions.schedule.biddingOpens")}
                        register={form.register("biddingOpens")}
                        error={form.formState.errors.biddingOpens?.message}
                    />
                    <UtcDateTimeField
                        id="auction-live-starts"
                        label={t("adminAuctions.schedule.liveStarts")}
                        register={form.register("liveStarts")}
                        error={form.formState.errors.liveStarts?.message}
                    />
                    <UtcDateTimeField
                        id="auction-lots-begin-closing"
                        label={t("adminAuctions.schedule.lotsBeginClosing")}
                        register={form.register("lotsBeginClosing")}
                        error={form.formState.errors.lotsBeginClosing?.message}
                    />
                    <UtcDateTimeField
                        id="auction-scheduled-end"
                        label={t("adminAuctions.schedule.scheduledEnd")}
                        register={form.register("scheduledEnd")}
                        error={form.formState.errors.scheduledEnd?.message}
                    />
                </div>
            </fieldset>
        </div>
    );
}

function UtcDateTimeField({
    id,
    label,
    register,
    error,
}: {
    readonly id: string;
    readonly label: string;
    readonly register: UseFormRegisterReturn;
    readonly error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type="datetime-local" step={60} {...register} />
            <FieldError message={error} />
        </div>
    );
}

function FieldError({ message }: { readonly message?: string }) {
    const { t } = useTranslation();
    if (!message) return null;
    return (
        <p role="alert" className="text-sm text-destructive">
            {t(message)}
        </p>
    );
}
