import { useCallback, useRef, useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type ApexCharts from "apexcharts";
import type { ItemEvent } from "@/data/internal/ItemDetails.ts";
import { H2 } from "@/components/typography/H2.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { PriceData } from "@/client";

const TIME_RANGES = [
    { label: "1T", days: 1 },
    { label: "5T", days: 5 },
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "6M", days: 180 },
    { label: "1J", days: 365 },
    { label: "Alle", days: null },
];

export function ItemPriceChart({ history }: { readonly history?: readonly ItemEvent[] }) {
    const chartRef = useRef<ApexCharts | null>(null);

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

    const priceEvents = (history ?? []).filter(
        (event): event is ItemEvent & { payload: PriceData } =>
            event.payload !== null &&
            typeof event.payload === "object" &&
            "amount" in event.payload,
    );

    /**
     * Maps the cleaned `priceEvents` array to the specific `{x, y}` coordinate format
     * required by ApexCharts for time-series charts.
     *
     * - `x` is set to the event's timestamp for the horizontal time axis.
     * - `y` is set to the price amount, converted from its minor unit (e.g., cents).
     */
    const priceData = priceEvents.map((event) => ({
        x: event.timestamp.getTime(),
        y: event.payload.amount / 100,
    }));

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
    const handleZoom = useCallback(
        (days: number | null) => {
            if (!chartRef.current) return;

            if (days === null) {
                chartRef.current.zoomX(minTimestamp, maxTimestamp);
            } else {
                const now = Date.now();
                const startDate = now - days * 24 * 60 * 60 * 1000;
                chartRef.current.zoomX(startDate, now);
            }
        },
        [minTimestamp, maxTimestamp],
    );

    if (!history || priceData.length === 0) {
        return (
            <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
                <H2>Preisverlauf</H2>
                <p className="text-sm text-muted-foreground">
                    Keine Preisdaten für diesen Artikel vorhanden.
                </p>
            </Card>
        );
    }

    /**
     * Defines the data series to be displayed on the chart.
     *
     * ApexCharts expects an array of objects, where each object represents a single
     * series (e.g., a line).
     * - `name`: The label used for the series in legends and tooltips.
     * - `data`: The array of {x, y} coordinate points to be plotted.
     */
    const series = [{ name: "Preis", data: priceData }];

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
            zoom: {
                enabled: true,
            },
            defaultLocale: "de",
            locales: [
                {
                    name: "de",
                    options: {
                        months: [
                            "Januar",
                            "Februar",
                            "März",
                            "April",
                            "Mai",
                            "Juni",
                            "Juli",
                            "August",
                            "September",
                            "Oktober",
                            "November",
                            "Dezember",
                        ],
                        shortMonths: [
                            "Jan",
                            "Feb",
                            "Mär",
                            "Apr",
                            "Mai",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Okt",
                            "Nov",
                            "Dez",
                        ],
                        days: [
                            "Sonntag",
                            "Montag",
                            "Dienstag",
                            "Mittwoch",
                            "Donnerstag",
                            "Freitag",
                            "Samstag",
                        ],
                        shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
                    },
                },
            ],
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
            type: "datetime",
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
                formatter: (val: number) => `€${val.toFixed(2)}`,
                style: {
                    fontSize: "15px",
                    fontWeight: 500,
                    fontFamily: "Geist, sans-serif",
                },
            },
        },
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
        <Card className="flex flex-col p-8 gap-4 shadow-md min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <H2>Preisverlauf</H2>
                <div className="flex gap-2 flex-wrap">
                    {TIME_RANGES.map((timeRange) => (
                        <Button
                            key={timeRange.label}
                            onClick={() => handleZoom(timeRange.days)}
                            variant={"outline"}
                            size="sm"
                        >
                            {timeRange.label}
                        </Button>
                    ))}
                </div>
            </div>
            <Chart options={options} series={series} type="area" height={350} />
        </Card>
    );
}
