import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

const STEPS = ["account", "verify", "profile"] as const;

type RegistrationStepsProps = {
    /** The current step, 1-based. */
    readonly current: 1 | 2 | 3;
};

/** Three-part progress rule above the registration steps: done oxblood, current ink. */
export function RegistrationSteps({ current }: RegistrationStepsProps) {
    const { t } = useTranslation();

    return (
        <ol
            aria-label={t("auth.steps.label", { current, total: STEPS.length })}
            className="grid grid-cols-3 gap-2"
        >
            {STEPS.map((step, index) => {
                const position = index + 1;
                const isCurrent = position === current;
                const isDone = position < current;

                return (
                    <li
                        key={step}
                        aria-current={isCurrent ? "step" : undefined}
                        className={cn(
                            "flex flex-col gap-2 font-mono text-tag uppercase",
                            isCurrent ? "text-ink" : "text-ink-muted",
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "h-0.5 rounded-xs",
                                isCurrent ? "bg-ink" : isDone ? "bg-oxblood" : "bg-line",
                            )}
                        />
                        <span>
                            {String(position).padStart(2, "0")} {t(`auth.steps.${step}`)}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
