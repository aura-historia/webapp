import { useRef, useMemo, useState, useEffect } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { ProductEvent } from "@/data/internal/ProductDetails.ts";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";

import {
    formatCompactCurrency,
    formatDate,
    formatTimeWithSeconds,
    getPriceAmount,
} from "@/lib/utils.ts";
import { isPriceEvent } from "@/lib/eventFilters.ts";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

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

export function ProductPriceChart({ history }: { readonly history?: readonly ProductEvent[] }) {
    const { t } = useTranslation();
    const chartRef = useRef<ApexCharts | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<number | null>(null);

    const TIME_RANGES = useMemo(() => createTimeRanges(t), [t]);
    /**
     * Filters the mixed `history` list and keeps only the events
     * that actually contain a price.
     *
     * This is necessary because the list contains two types of events: simple
     * status events (e.g., ‘SOLD’) and price events (objects with `amount`).
     * This code acts as a safe filter that only lets price events
     * through and blocks status events, because that is exactly the data we need to create a price history

     * NOTE: I talked to Julian again about this and suggested or asked whether it wouldn't make more sense to
     * keep separate histories in the backend (e.g., a pure `priceHistory`) instead of
     * putting everything into one, also because there will be even more types.
     * This would mean we wouldn't have to filter by type here and would get the data we need directly. But he wanted to think about it again.
     */

    const priceEvents = (history ?? []).filter(isPriceEvent);

    /**
     * Maps the cleaned `priceEvents` array to the specific `{x, y}` coordinate format
     * required by ApexCharts for time-series charts.
     *
     * - `x` is set to the event's timestamp for the horizontal time axis.
     * - `y` is set to the price amount, converted from its minor unit (e.g., cents).
     */
    const priceData = priceEvents.flatMap((event) => {
        const priceAmount = getPriceAmount(event);

        if (priceAmount === undefined) {
            return [];
        }

        return [
            {
                x: event.timestamp.getTime(),
                y: priceAmount / 100,
            },
        ];
    });

    if (priceData.length > 0) {
        const lastPrice = priceData.at(-1);
        priceData.push({
            x: Date.now(),
            y: lastPrice?.y ?? 0,
        });
    }

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
        setSelectedTimeRange(days);
    };

    useEffect(() => {
        if (!chartRef.current) return;

        if (selectedTimeRange === null) {
            return chartRef.current?.zoomX(minTimestamp, maxTimestamp);
        }

        const totalDays = (maxTimestamp - minTimestamp) / (24 * 60 * 60 * 1000);

        if (selectedTimeRange >= totalDays) {
            chartRef.current.zoomX(minTimestamp, maxTimestamp);
        } else {
            const startDate = maxTimestamp - selectedTimeRange * 24 * 60 * 60 * 1000;
            chartRef.current.zoomX(startDate, maxTimestamp);
        }
    }, [selectedTimeRange, maxTimestamp, minTimestamp]);

    if (!history || priceData.length === 0) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>{t("product.priceChart.title")}</H2>
                <p className="text-sm text-muted-foreground">{t("product.priceChart.noData")}</p>
            </Card>
        );
    }

    /**
     * Defines the data series to be displayed on the chart.
     *
     * ApexCharts expects an array of objects, where each object represents a single
     * series (e.g., a line).
     * - `name`: The label used for the series in legends and tooltips.
     */
    const series = [{ name: t("product.priceChart.seriesName"), data: priceData }];

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
            events: {
                mounted: (chart) => {
                    chartRef.current = chart;
                },
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
                beforeZoom: (_chartContext, { xaxis }) => {
                    const isCompletelyOutside =
                        xaxis.max < minTimestamp || xaxis.min > maxTimestamp;

                    if (isCompletelyOutside) {
                        return {
                            xaxis: {
                                min: minTimestamp,
                                max: maxTimestamp,
                            },
                        };
                    }
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
                        return formatTimeWithSeconds(date, "de-DE");
                    }

                    return formatDate(date, "de-DE");
                },
                style: {
                    fontSize: "15px",
                    fontWeight: 500,
                    fontFamily: "Geist, sans-serif",
                },
            },
            min: minTimestamp,
            max: maxTimestamp,
        },
        yaxis: {
            labels: {
                formatter: (val: number) => formatCompactCurrency(val),
                style: {
                    fontSize: "15px",
                    fontWeight: 500,
                    fontFamily: "Geist, sans-serif",
                },
            },
        },
        responsive: [
            {
                breakpoint: 640,
                options: {
                    xaxis: {
                        tickAmount: 3,
                        labels: {
                            style: {
                                fontSize: "15px",
                                fontWeight: 500,
                                fontFamily: "Geist, sans-serif",
                            },
                        },
                    },
                    yaxis: {
                        labels: {
                            formatter: (val: number) => formatCompactCurrency(val),
                            style: {
                                fontSize: "15px",
                                fontWeight: 500,
                                fontFamily: "Geist, sans-serif",
                            },
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
                            style: {
                                fontSize: "15px",
                                fontWeight: 500,
                                fontFamily: "Geist, sans-serif",
                            },
                        },
                    },
                    yaxis: {
                        labels: {
                            formatter: (val: number) => formatCompactCurrency(val),
                            style: {
                                fontSize: "15px",
                                fontWeight: 500,
                                fontFamily: "Geist, sans-serif",
                            },
                            offsetX: -10,
                        },
                    },
                },
            },
        ],
        colors: ["#b2905f"],
        stroke: {
            curve: "smooth",
            width: 3.5,
        },
        tooltip: {
            x: { format: "dd MMM yyyy HH:mm" },
        },
    };
    return (
        <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0 h-full">
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center sm:justify-between lg:justify-between gap-4">
                <H2>{t("product.priceChart.title")}</H2>
                <div className="flex gap-2 flex-wrap">
                    {TIME_RANGES.map((timeRange) => (
                        <Button
                            key={timeRange.label}
                            onClick={() => handleZoom(timeRange.days)}
                            variant={timeRange.days === selectedTimeRange ? "default" : "outline"}
                            size="sm"
                        >
                            {timeRange.label}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex-1 min-h-[300px]">
                <Chart options={options} series={series} type="area" height="100%" />
            </div>
        </Card>
    );
}
