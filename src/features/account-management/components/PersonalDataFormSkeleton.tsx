import { useTranslation } from "react-i18next";
import { CARD_CLASS } from "@/features/account-management/lib/accountStyles.ts";
import { cn } from "@/lib/utils.ts";

const BAR = "rounded-xs bg-surface-sunken";
const FIELD = "h-12 rounded-md bg-surface-sunken";

function FieldSkeleton({ labelWidth }: { readonly labelWidth: string }) {
    return (
        <div className="flex flex-col gap-2">
            <div className={cn(BAR, "h-2.5", labelWidth)} />
            <div className={FIELD} />
        </div>
    );
}

/** Matches the personal data card while the account loads (design board "Account · States"). */
export function PersonalDataFormSkeleton() {
    const { t } = useTranslation();

    return (
        <div
            role="status"
            aria-busy="true"
            aria-label={t("account.personalData.loading")}
            className={cn(CARD_CLASS, "flex flex-col gap-5 motion-safe:animate-pulse")}
        >
            <div className={cn(BAR, "h-2.5 w-16")} />
            <FieldSkeleton labelWidth="w-11" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FieldSkeleton labelWidth="w-[72px]" />
                <FieldSkeleton labelWidth="w-[72px]" />
            </div>
            <div className="h-px bg-line-subtle" />
            <div className={cn(BAR, "h-2.5 w-[92px]")} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <FieldSkeleton labelWidth="w-[60px]" />
                <FieldSkeleton labelWidth="w-[60px]" />
                <FieldSkeleton labelWidth="w-[60px]" />
            </div>
            <div className="h-24 rounded-lg bg-surface-sunken" />
            <div className="flex justify-end border-t border-line-subtle pt-5">
                <div className="h-12 w-full rounded-pill bg-surface-sunken sm:w-[148px]" />
            </div>
        </div>
    );
}
