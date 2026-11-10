import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ADMIN_SKELETON_CLASS, FOCUS_CLASS } from "@/features/admin/common/lib/adminStyles.ts";
import { useServiceStatus } from "@/features/service-status/hooks/useServiceStatus.ts";
import {
    livenessState,
    readinessState,
    type ServiceAvailability,
    type ServiceProbe,
    type ServiceProbeState,
} from "@/features/service-status/lib/serviceAvailability.ts";
import { cn } from "@/lib/utils.ts";

const TITLE_ID = "admin-overview-service-status-title";

const META_CLASS = "font-mono text-[10px] tracking-[0.12em] text-ink-muted uppercase";

/** The dot beside a state, always next to its label; signal-live is used only on this ink card. */
const DOT_CLASS: Record<ServiceAvailability | ServiceProbeState, string> = {
    operational: "bg-signal-live",
    available: "bg-signal-live",
    maintenance: "bg-brass-light",
    disruption: "bg-oxblood shadow-[inset_0_0_0_1.5px_var(--on-oxblood)]",
    unavailable: "bg-oxblood shadow-[inset_0_0_0_1.5px_var(--on-oxblood)]",
};

function ProbeRow({
    label,
    endpoint,
    probe,
    state,
    language,
    className,
}: {
    readonly label: string;
    readonly endpoint: string;
    readonly probe: ServiceProbe;
    readonly state: ServiceProbeState;
    readonly language: string;
    readonly className?: string;
}) {
    const { t } = useTranslation();
    const latency = new Intl.NumberFormat(language, {
        style: "unit",
        unit: "millisecond",
        unitDisplay: "short",
    }).format(probe.latencyMs);
    const meta =
        probe.httpStatus === null
            ? t("adminOverview.serviceStatus.noResponse")
            : `HTTP ${probe.httpStatus} · ${latency}`;

    return (
        <div className={cn("flex min-w-0 flex-col gap-2", className)}>
            <dt className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[15px] font-medium">{label}</span>
                <code className="font-mono text-[11px] text-ink-muted">{endpoint}</code>
            </dt>
            <dd className="flex items-center gap-2 text-sm">
                <span aria-hidden="true" className={cn("size-2 rounded-pill", DOT_CLASS[state])} />
                {t(`adminOverview.serviceStatus.probeStates.${state}`)}
            </dd>
            <dd className="font-mono text-[11px] tracking-[0.08em] text-ink-muted uppercase tabular-nums">
                {meta}
            </dd>
        </div>
    );
}

/**
 * The ink service-status card (board "Admin · Overview"): overall state, what visitors see, and both
 * probes. It runs the same browser-side check as the public notice and shares its query cache, so it
 * never issues separate requests and stays visible when the counts cannot load.
 */
export function AdminServiceStatusPanel({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    const { result, isChecking, check } = useServiceStatus();

    return (
        <section
            data-theme="dark"
            aria-labelledby={TITLE_ID}
            aria-busy={isChecking}
            className="flex flex-col gap-7 rounded-card bg-surface px-5 py-6 text-ink sm:px-9 sm:pt-8 sm:pb-7"
        >
            <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex min-w-0 flex-col gap-3">
                    <h2
                        id={TITLE_ID}
                        className="font-mono text-[11px] font-normal tracking-[0.16em] text-brass-light uppercase"
                    >
                        {t("adminOverview.serviceStatus.title")}
                    </h2>
                    {result ? (
                        <>
                            <p className="flex items-center gap-3">
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "size-2.5 shrink-0 rounded-pill",
                                        DOT_CLASS[result.availability],
                                        result.availability === "operational" &&
                                            "animate-pulse motion-reduce:animate-none",
                                    )}
                                />
                                <span className="font-serif text-[30px] leading-[1.05] tracking-[-0.01em] sm:text-[40px]">
                                    {t(
                                        `adminOverview.serviceStatus.availability.${result.availability}`,
                                    )}
                                </span>
                            </p>
                            <p className="text-sm leading-normal text-ink-secondary">
                                {t(
                                    `adminOverview.serviceStatus.visitorNotice.${result.availability}`,
                                )}
                            </p>
                        </>
                    ) : (
                        <>
                            <output className="sr-only">
                                {t("adminOverview.serviceStatus.loading")}
                            </output>
                            <span
                                aria-hidden="true"
                                className={cn(ADMIN_SKELETON_CLASS, "h-9 w-56 max-w-full")}
                            />
                            <span
                                aria-hidden="true"
                                className={cn(ADMIN_SKELETON_CLASS, "h-3.5 w-44 max-w-full")}
                            />
                        </>
                    )}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                    <button
                        type="button"
                        onClick={check}
                        disabled={isChecking}
                        className={cn(
                            "inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-pill px-[18px] text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:enabled:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60",
                            FOCUS_CLASS,
                        )}
                    >
                        <RefreshCw
                            aria-hidden="true"
                            className={cn(
                                "size-[15px]",
                                isChecking && "animate-spin motion-reduce:animate-none",
                            )}
                            strokeWidth={1.9}
                        />
                        {isChecking
                            ? t("adminOverview.serviceStatus.checking")
                            : t("adminOverview.serviceStatus.check")}
                    </button>
                    {result && (
                        // Client-fetched data only: the check time is read after mount, never on the server.
                        <span className={META_CLASS}>
                            {t("adminOverview.serviceStatus.lastChecked", {
                                time: new Intl.DateTimeFormat(language, {
                                    timeStyle: "medium",
                                }).format(result.checkedAt),
                            })}
                        </span>
                    )}
                </div>
            </div>

            {result ? (
                <dl className="grid grid-cols-1 border-t border-line md:grid-cols-2">
                    <ProbeRow
                        label={t("adminOverview.serviceStatus.probes.liveness")}
                        endpoint="GET /v1/health"
                        probe={result.snapshot.liveness}
                        state={livenessState(result.snapshot.liveness)}
                        language={language}
                        className="py-[18px] md:pt-5 md:pr-7 md:pb-1"
                    />
                    <ProbeRow
                        label={t("adminOverview.serviceStatus.probes.readiness")}
                        endpoint="GET /v1/ready"
                        probe={result.snapshot.readiness}
                        state={readinessState(result.snapshot.readiness)}
                        language={language}
                        className="border-t border-line py-[18px] md:border-t-0 md:pt-5 md:pb-1 md:pl-7 md:shadow-[inset_1px_0_0_var(--line)]"
                    />
                </dl>
            ) : (
                <div
                    aria-hidden="true"
                    className="grid grid-cols-1 gap-4 border-t border-line pt-5 md:grid-cols-2"
                >
                    <span className={cn(ADMIN_SKELETON_CLASS, "h-16")} />
                    <span className={cn(ADMIN_SKELETON_CLASS, "h-16")} />
                </div>
            )}
        </section>
    );
}
