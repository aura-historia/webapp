import { AlertTriangle, CheckCircle2, RefreshCw, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
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

function StateIcon({ state }: { readonly state: ServiceProbeState | ServiceAvailability }) {
    if (state === "maintenance") {
        return <Wrench className="size-4 shrink-0 text-tertiary" aria-hidden="true" />;
    }
    if (state === "available" || state === "operational") {
        return <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />;
    }
    return <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden="true" />;
}

function ProbeRow({
    label,
    endpoint,
    probe,
    state,
    language,
}: {
    readonly label: string;
    readonly endpoint: string;
    readonly probe: ServiceProbe;
    readonly state: ServiceProbeState;
    readonly language: string;
}) {
    const { t } = useTranslation();
    const latency = new Intl.NumberFormat(language, {
        style: "unit",
        unit: "millisecond",
        unitDisplay: "short",
    }).format(probe.latencyMs);
    const response =
        probe.httpStatus === null
            ? t("adminOverview.serviceStatus.noResponse")
            : `HTTP ${probe.httpStatus}`;

    return (
        <div className="grid content-start gap-1.5 border border-border p-3">
            <dt className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                <span className="font-medium">{label}</span>
                <code className="text-xs text-muted-foreground">{endpoint}</code>
            </dt>
            <dd className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <StateIcon state={state} />
                <span>{t(`adminOverview.serviceStatus.probeStates.${state}`)}</span>
                <span className="text-muted-foreground tabular-nums">
                    {response} · {latency}
                </span>
            </dd>
        </div>
    );
}

/**
 * Same browser-side check that drives the public notice, with per-endpoint detail. It shares
 * the query cache with the site banner rather than issuing separate requests.
 */
export function AdminServiceStatusPanel({ language }: { readonly language: string }) {
    const { t } = useTranslation();
    const { result, isChecking, check } = useServiceStatus();

    return (
        <section
            aria-labelledby={TITLE_ID}
            aria-busy={isChecking}
            className="grid gap-4 border border-border bg-card p-5"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                    <h2 id={TITLE_ID} className="font-display text-xl italic">
                        {t("adminOverview.serviceStatus.title")}
                    </h2>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                        {t("adminOverview.serviceStatus.description")}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={check} disabled={isChecking}>
                    <RefreshCw
                        className={cn("size-4", isChecking && "animate-spin")}
                        aria-hidden="true"
                    />
                    {t("adminOverview.serviceStatus.check")}
                </Button>
            </div>

            {result ? (
                <>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <StateIcon state={result.availability} />
                        <span className="font-medium">
                            {t(`adminOverview.serviceStatus.availability.${result.availability}`)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {t(`adminOverview.serviceStatus.visitorNotice.${result.availability}`)}
                        </span>
                    </p>
                    <dl className="grid gap-3 md:grid-cols-2">
                        <ProbeRow
                            label={t("adminOverview.serviceStatus.probes.liveness")}
                            endpoint="GET /api/v1/health"
                            probe={result.snapshot.liveness}
                            state={livenessState(result.snapshot.liveness)}
                            language={language}
                        />
                        <ProbeRow
                            label={t("adminOverview.serviceStatus.probes.readiness")}
                            endpoint="GET /api/v1/ready"
                            probe={result.snapshot.readiness}
                            state={readinessState(result.snapshot.readiness)}
                            language={language}
                        />
                    </dl>
                    <p className="text-xs text-muted-foreground">
                        {t("adminOverview.serviceStatus.checkedAt", {
                            time: new Intl.DateTimeFormat(language, {
                                timeStyle: "medium",
                            }).format(result.checkedAt),
                        })}
                    </p>
                </>
            ) : (
                <div className="grid gap-3">
                    <output className="sr-only">{t("adminOverview.serviceStatus.loading")}</output>
                    <Skeleton className="h-6 w-64 max-w-full" />
                    <div className="grid gap-3 md:grid-cols-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
            )}
        </section>
    );
}
