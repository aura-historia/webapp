import { useRef, useMemo, useState, useEffect } from "react";
import type { ApexOptions } from "apexcharts";
import type { Currency } from "@/data/internal/common/Currency.ts";
import type { ProductListingHistoryEntry } from "@/data/internal/product/ProductListingHistory.ts";
import { ProductSectionHeading } from "@/features/product/detail/components/ProductSectionHeading.tsx";
import { cn } from "@/lib/utils.ts";

import { formatCompactCurrency, formatDate, formatTimeWithSeconds } from "@/lib/utils.ts";
import {
    getDisplayPriceHistorySeries,
    getPriceHistorySeries,
    type PriceHistoryPoint,
} from "@/features/product/detail/lib/events/priceHistory.ts";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ClientOnly, useRouteContext } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import Chart from "react-apexcharts";

const HEADING_ID = "product-price-history-title";
const FOCUS_CLASS =
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";
const AXIS_FONT = {
    fontSize: "10px",
    fontWeight: 400,
    fontFamily: '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace',
};

interface ApexFormatterOpts {
    w?: {
        globals?: {
            minX: number;
            maxX: number;
        };
    };
}

const createTimeRanges = (t: TFunction) => {
    return [
        { label: t("product.priceChart.timeRanges.1d"), days: 1 },
        { label: t("product.priceChart.timeRanges.5d"), days: 5 },
        { label: t("product.priceChart.timeRanges.1m"), days: 30 },
        { label: t("product.priceChart.timeRanges.3m"), days: 90 },
        { label: t("product.priceChart.timeRanges.6m"), days: 180 },
        { label: t("product.priceChart.timeRanges.1y"), days: 365 },
        { label: t("product.priceChart.timeRanges.all"), days: null },
    ] as const;
};

type ZoomableChartHandle = {
    zoomX: (start: number, end: number) => void;
};

type ZoomRange = {
    xaxis: {
        min: number;
        max: number;
    };
};

/**
 * A selectable chart view: either one source-currency series, or the single series of backend
 * historical projections into the requested display currency. Views never share an axis.
 */
type PriceChartView = {
    readonly key: string;
    readonly kind: "source" | "display";
    readonly currency: string;
    readonly data: readonly PriceHistoryPoint[];
};

const isZoomableChart = (chart: unknown): chart is ZoomableChartHandle => {
    return (
        typeof chart === "object" &&
        chart !== null &&
        "zoomX" in chart &&
        typeof chart.zoomX === "function"
    );
};

/** Zooms programmatically and marks the "zoomed" events this emits as not the viewer's. */
function zoomChart(
    chart: ZoomableChartHandle,
    programmaticZoomUntil: { current: number },
    start: number,
    end: number,
) {
    programmaticZoomUntil.current = Date.now() + 800;
    chart.zoomX(start, end);
}

export function ProductPriceChart({
    history,
    displayCurrency,
}: {
    readonly history?: readonly ProductListingHistoryEntry[];
    /** Requested display currency; omit to offer source-currency views only. */
    readonly displayCurrency?: Currency;
}) {
    const { t, i18n } = useTranslation();
    const { timeZone } = useRouteContext({ from: "__root__" });
    const chartRef = useRef<ApexCharts | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(null);
    const [selectedViewOverride, setSelectedViewOverride] = useState<string>();
    /** True after the viewer drags to zoom; a selected range counts as zoomed too. */
    const [isDragZoomed, setIsDragZoomed] = useState(false);
    /** Our own zoomX calls also emit "zoomed"; events before this time are ignored. */
    const programmaticZoomUntil = useRef(0);
    const isZoomed = isDragZoomed || selectedTimeRange !== null;

    const TIME_RANGES = useMemo(() => createTimeRanges(t), [t]);
    const sourceSeries = getPriceHistorySeries(history ?? []);
    // A history priced only in the requested currency already is that view; its same-currency
    // projections would only duplicate it, with gaps before the first FX snapshot.
    const displaySeries = sourceSeries.some(({ currency }) => currency !== displayCurrency)
        ? getDisplayPriceHistorySeries(history ?? [], displayCurrency)
        : undefined;
    const displayView: PriceChartView | undefined = displaySeries && {
        key: `display:${displaySeries.currency}`,
        kind: "display",
        ...displaySeries,
    };
    const sourceViews: PriceChartView[] = sourceSeries.map((series) => ({
        key: `source:${series.currency}`,
        kind: "source",
        ...series,
    }));
    const views = displayView ? [displayView, ...sourceViews] : sourceViews;
    const selectedView =
        views.find(({ key }) => key === selectedViewOverride) ?? displayView ?? sourceViews.at(-1);
    const selectedCurrency = selectedView?.currency;
    const priceData = selectedView?.data ?? [];

    /**
     *  Determines the earliest (`minTimestamp`) and latest (`maxTimestamp`) timestamps from the existing price data.
     *  The `useMemo` hook optimizes performance by ensuring, that this calculation is only performed again when the
     *  `priceData` actually changes, and not with every single re-render. */
    const { minTimestamp, maxTimestamp } = useMemo(() => {
        const timestamps = priceData.map((d) => d.x);
        return {
            minTimestamp: Math.min(...timestamps),
            maxTimestamp: Math.max(...timestamps),
        };
    }, [priceData]);

    /**
     * Zooms the chart to a specific time period.
     *
     * @param days - Number of days from today to be displayed, or zero for the entire available data period
     *
     */
    const handleZoom = (days: number | null) => {
        setIsDragZoomed(false);
        setSelectedTimeRange(days);
    };

    /** Back to the whole series: clears a drag zoom as well as a selected range. */
    const handleResetZoom = () => {
        setSelectedTimeRange(null);
        setIsDragZoomed(false);
        const chart = chartRef.current as unknown;
        if (isZoomableChart(chart) && Number.isFinite(minTimestamp)) {
            zoomChart(chart, programmaticZoomUntil, minTimestamp, maxTimestamp);
        }
    };

    useEffect(() => {
        if (!Number.isFinite(minTimestamp) || !Number.isFinite(maxTimestamp)) return;

        const chart = chartRef.current as unknown;
        if (!isZoomableChart(chart)) return;

        if (selectedTimeRange === null) {
            zoomChart(chart, programmaticZoomUntil, minTimestamp, maxTimestamp);
            return;
        }

        const totalDays = (maxTimestamp - minTimestamp) / (24 * 60 * 60 * 1000);

        if (selectedTimeRange >= totalDays) {
            zoomChart(chart, programmaticZoomUntil, minTimestamp, maxTimestamp);
        } else {
            const startDate = maxTimestamp - selectedTimeRange * 24 * 60 * 60 * 1000;
            zoomChart(chart, programmaticZoomUntil, startDate, maxTimestamp);
        }
    }, [selectedTimeRange, maxTimestamp, minTimestamp]);

    if (priceData.length === 0) {
        return (
            <section
                aria-labelledby={HEADING_ID}
                className="flex min-w-0 flex-col gap-6 rounded-figure bg-surface-raised p-5 shadow-ring sm:p-8"
            >
                <ProductSectionHeading id={HEADING_ID} title={t("product.priceChart.title")} />
                <div className="flex h-55 items-center justify-center rounded-md bg-[repeating-linear-gradient(180deg,transparent_0_54px,var(--color-line-subtle)_54px_55px)]">
                    <p className="rounded-pill bg-surface-raised px-4 py-2.5 text-body-sm text-ink-secondary shadow-field">
                        {t("product.priceChart.noData")}
                    </p>
                </div>
            </section>
        );
    }

    /**
     * Defines the data series to be displayed on the chart.
     *
     * ApexCharts expects an array of objects, where each object represents a single
     * series (e.g., a line).
     * - `name`: The label used for the series in legends and tooltips.
     */
    const series = [
        {
            name:
                selectedView?.kind === "display"
                    ? t("product.priceChart.displaySeriesName", { currency: selectedCurrency })
                    : t("product.priceChart.seriesName", { currency: selectedCurrency }),
            data: [...priceData],
        },
    ];

    const handleBeforeZoom: (chart: ApexCharts, options?: ZoomRange) => void = (
        _chartContext,
        options,
    ) => {
        const xaxis = options?.xaxis;

        if (!xaxis || !Number.isFinite(xaxis.min) || !Number.isFinite(xaxis.max)) {
            return;
        }

        const isCompletelyOutside = xaxis.max < minTimestamp || xaxis.min > maxTimestamp;

        if (isCompletelyOutside) {
            return {
                xaxis: {
                    min: minTimestamp,
                    max: maxTimestamp,
                },
            };
        }
    };

    /**
     * Defines the visual appearance and behavior of the chart.
     *
     * This configuration object tells ApexCharts how to render the data provided
     * in the `series` prop.
     */
    const options: ApexOptions = {
        chart: {
            id: "price-chart",
            type: "area",
            toolbar: { show: false },
            background: "transparent",
            foreColor: "var(--color-ink-muted)",
            fontFamily: AXIS_FONT.fontFamily,
            events: {
                /**
                 * Prevents a bug in ApexCharts where the graph renders incorrectly
                 *
                 * If the user zooms into a time range that is completely outside of the
                 * available data (`minTimestamp` to `maxTimestamp`), the graph disappears
                 * and the time axis displays incorrect values.
                 *
                 * This function intercepts such an attempt and resets the zoom to the
                 * entire available data range instead, ensuring the chart display remains stable.
                 */
                beforeZoom: handleBeforeZoom,
                zoomed: () => {
                    if (Date.now() < programmaticZoomUntil.current) return;
                    setIsDragZoomed(true);
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            type: "numeric",
            tickAmount: 5,
            labels: {
                /**
                 * Custom X-axis label formatter.
                 *
                 * We use type="numeric" instead of type="datetime" because:
                 * - "datetime" ignores tickAmount → generates too many labels with dense data
                 * - Labels overlap and become unreadable
                 * - Date format customization is limited
                 * - No responsive breakpoint support
                 *
                 * With "numeric" we get:
                 * - Full control via tickAmount (works with responsive breakpoints)
                 * - Custom formatting based on time range:
                 *   - ≤ 1 day → time with seconds (14:30:45)
                 *   - > 1 day → date (12.10.2025)
                 * - Dynamic adjustment when zooming (via opts.w.globals)
                 */
                formatter: (
                    value: string | number,
                    _timestamp?: number,
                    opts?: ApexFormatterOpts,
                ): string => {
                    const timestamp = Number(value);
                    const date = new Date(timestamp);

                    let timeRange = maxTimestamp - minTimestamp;

                    if (opts?.w?.globals) {
                        const currentMinX = opts.w.globals.minX;
                        const currentMaxX = opts.w.globals.maxX;
                        timeRange = currentMaxX - currentMinX;
                    }

                    const oneDayInMs = 24 * 60 * 60 * 1000;

                    if (timeRange <= oneDayInMs) {
                        return formatTimeWithSeconds(date, i18n.language, timeZone);
                    }

                    return formatDate(date, i18n.language, timeZone);
                },
                style: AXIS_FONT,
            },
            min: minTimestamp,
            max: maxTimestamp,
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (val: number) =>
                    formatCompactCurrency(val, selectedCurrency ?? "EUR", i18n.language),
                style: AXIS_FONT,
            },
        },
        grid: {
            borderColor: "var(--color-line-subtle)",
            strokeDashArray: 0,
            xaxis: { lines: { show: false } },
        },
        responsive: [
            {
                breakpoint: 640,
                options: {
                    xaxis: {
                        tickAmount: 3,
                        labels: {
                            style: AXIS_FONT,
                        },
                    },
                    yaxis: {
                        labels: {
                            formatter: (val: number) =>
                                formatCompactCurrency(
                                    val,
                                    selectedCurrency ?? "EUR",
                                    i18n.language,
                                ),
                            style: AXIS_FONT,
                            offsetX: -15,
                        },
                    },
                },
            },
            {
                breakpoint: 1024,
                options: {
                    xaxis: {
                        tickAmount: 3,
                        labels: {
                            style: AXIS_FONT,
                        },
                    },
                    yaxis: {
                        labels: {
                            formatter: (val: number) =>
                                formatCompactCurrency(
                                    val,
                                    selectedCurrency ?? "EUR",
                                    i18n.language,
                                ),
                            style: AXIS_FONT,
                            offsetX: -10,
                        },
                    },
                },
            },
        ],
        colors: ["var(--color-oxblood)"],
        // Listing prices change in steps, so the line holds each price until the next change.
        stroke: {
            curve: "stepline",
            width: 2,
        },
        fill: {
            type: "solid",
            opacity: 0.07,
        },
        markers: {
            size: 0,
            hover: { size: 5 },
            discrete: [
                {
                    seriesIndex: 0,
                    dataPointIndex: priceData.length - 1,
                    fillColor: "var(--color-oxblood)",
                    strokeColor: "var(--color-surface-raised)",
                    size: 6,
                },
            ],
        },
        tooltip: {
            x: { format: "dd MMM yyyy HH:mm" },
        },
    };
    return (
        <section
            aria-labelledby={HEADING_ID}
            className="flex min-w-0 flex-col rounded-figure bg-surface-raised p-5 shadow-ring sm:p-8"
        >
            <div className="mb-6 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-4">
                <ProductSectionHeading id={HEADING_ID} title={t("product.priceChart.title")} />
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-3">
                    {views.length > 1 && (
                        <fieldset className="m-0 flex gap-5 border-0 p-0">
                            <legend className="sr-only">
                                {t("product.priceChart.currencyViewLabel")}
                            </legend>
                            {views.map((view) => {
                                const selected = view.key === selectedView?.key;
                                return (
                                    <button
                                        type="button"
                                        key={view.key}
                                        aria-pressed={selected}
                                        aria-label={
                                            view.kind === "display"
                                                ? t("product.priceChart.displaySelect", {
                                                      currency: view.currency,
                                                  })
                                                : t("product.priceChart.currencySelect", {
                                                      currency: view.currency,
                                                  })
                                        }
                                        onClick={() => setSelectedViewOverride(view.key)}
                                        className={cn(
                                            "relative h-10 cursor-pointer font-mono text-label tracking-[0.14em] uppercase",
                                            FOCUS_CLASS,
                                            selected ? "text-ink" : "text-ink-muted hover:text-ink",
                                        )}
                                    >
                                        {view.kind === "display"
                                            ? t("product.priceChart.displayOption", {
                                                  currency: view.currency,
                                              })
                                            : view.currency}
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "absolute inset-x-0 bottom-1 h-0.5 rounded-xs",
                                                selected ? "bg-oxblood" : "bg-transparent",
                                            )}
                                        />
                                    </button>
                                );
                            })}
                        </fieldset>
                    )}
                    <div
                        role="group"
                        aria-label={t("product.priceChart.timeRangeLabel")}
                        className="flex gap-1 rounded-pill bg-surface p-1 shadow-field max-sm:justify-between"
                    >
                        {TIME_RANGES.map((timeRange) => {
                            const selected = timeRange.days === selectedTimeRange;
                            return (
                                <button
                                    type="button"
                                    key={timeRange.label}
                                    aria-pressed={selected}
                                    onClick={() => handleZoom(timeRange.days)}
                                    className={cn(
                                        "h-9 min-w-0 flex-1 cursor-pointer rounded-pill px-2.5 font-mono text-label tracking-[0.06em] sm:h-8 sm:min-w-10 sm:flex-none sm:tracking-[0.08em]",
                                        FOCUS_CLASS,
                                        selected
                                            ? "bg-oxblood text-on-oxblood"
                                            : "text-ink-secondary hover:text-ink",
                                    )}
                                >
                                    {timeRange.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ApexCharts' reset icon is hidden (important beats its unlayered CSS); the pill replaces it. */}
            <div className="relative h-60 min-w-0 sm:h-80 [&_.apexcharts-reset-icon]:hidden! [&_.apexcharts-toolbar]:hidden!">
                {isZoomed && (
                    <button
                        type="button"
                        onClick={handleResetZoom}
                        className={cn(
                            "absolute -top-1 right-0 z-10 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-pill bg-surface-raised px-3 text-meta font-medium text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-surface-sunken",
                            FOCUS_CLASS,
                        )}
                    >
                        <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                        {t("product.priceChart.resetZoom")}
                    </button>
                )}
                <ClientOnly
                    fallback={
                        <div className="size-full animate-pulse rounded-md bg-surface-sunken" />
                    }
                >
                    <Chart
                        chartRef={chartRef}
                        options={options}
                        series={series}
                        type="area"
                        height="100%"
                    />
                </ClientOnly>
            </div>
            {selectedView?.kind === "display" && (
                <p className="mt-6 max-w-[760px] border-t border-line-subtle pt-4 text-meta leading-[1.5] text-ink-muted">
                    {t("product.priceChart.displayNote")}
                </p>
            )}
        </section>
    );
}
