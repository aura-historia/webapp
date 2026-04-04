import type {
    ProductEvent,
    ProductEstimatePriceChangedPayload,
} from "@/data/internal/product/ProductDetails.ts";
import {
    TimelineItem,
    TimelineTitle,
    TimelineDescription,
    TimelineTime,
    TimelineHeader,
} from "@/components/ui/timeline.tsx";
import { StatusBadge } from "@/components/product/badges/StatusBadge.tsx";
import { PriceBadge } from "@/components/product/badges/PriceBadge.tsx";
import { formatDate, formatTime, formatStateName } from "@/lib/utils.ts";
import {
    isCreatedEvent,
    isPriceChangedEvent,
    isPriceDiscoveredEvent,
    isPriceRemovedEvent,
    isStateChangedEvent,
    isEstimatePriceChangedEvent,
    isUrlChangedEvent,
    isImagesChangedEvent,
    isAuctionTimeChangedEvent,
    isOriginYearChangedEvent,
    isAuthenticityChangedEvent,
    isConditionChangedEvent,
    isProvenanceChangedEvent,
    isRestorationChangedEvent,
} from "@/lib/eventFilters.ts";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/data/internal/price/Price.ts";
import { AUTHENTICITY_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Authenticity.ts";
import { CONDITION_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Condition.ts";
import { PROVENANCE_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Provenance.ts";
import { RESTORATION_TRANSLATION_CONFIG } from "@/data/internal/quality-indicators/Restoration.ts";
import { formatOriginYear } from "@/components/product/detail/quality-indicator/ProductQualityIndicator.helpers.ts";

interface ProductEventHistoryProps {
    readonly event: ProductEvent;
}

function formatEstimatePriceDetail(
    payload: ProductEstimatePriceChangedPayload,
    locale: string,
): string {
    const parts: string[] = [];
    if (payload.priceEstimateMin) {
        parts.push(formatPrice(payload.priceEstimateMin, locale));
    }
    if (payload.priceEstimateMax) {
        parts.push(formatPrice(payload.priceEstimateMax, locale));
    }
    return parts.length > 0 ? ` • ${parts.join(" – ")}` : "";
}

export function ProductEventHistory({ event }: ProductEventHistoryProps) {
    const { t, i18n } = useTranslation();

    const timeBlock = (
        <TimelineTime>
            <span>{formatDate(event.timestamp, i18n.language)}</span>
            <span className="text-muted-foreground">
                {formatTime(event.timestamp, i18n.language)}
            </span>
        </TimelineTime>
    );

    if (isStateChangedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>
                        <StatusBadge status={event.payload.newState} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.statusChanged", {
                        oldState: formatStateName(event.payload.oldState, t),
                        newState: formatStateName(event.payload.newState, t),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceDiscoveredEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>
                        <PriceBadge eventType="PRICE_DISCOVERED" />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.priceDiscovered", {
                        price: formatPrice(event.payload.newPrice, i18n.language),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceChangedEvent(event)) {
        const isDropped = event.payload.newPrice.amount < event.payload.oldPrice.amount;
        const verb = isDropped
            ? t("product.history.events.priceFallen")
            : t("product.history.events.priceIncreased");

        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>
                        <PriceBadge eventType={isDropped ? "PRICE_DROPPED" : "PRICE_INCREASED"} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.priceChanged", {
                        oldPrice: formatPrice(event.payload.oldPrice, i18n.language),
                        newPrice: formatPrice(event.payload.newPrice, i18n.language),
                        verb,
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isPriceRemovedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>
                        <PriceBadge eventType="PRICE_REMOVED" />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.priceRemoved", {
                        price: formatPrice(event.payload.oldPrice, i18n.language),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isCreatedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>
                        <StatusBadge status={event.payload.state} />
                    </TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.created")}
                    {event.payload.price
                        ? ` • ${formatPrice(event.payload.price, i18n.language)}`
                        : ""}
                    .
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isEstimatePriceChangedEvent(event)) {
        const detail = formatEstimatePriceDetail(event.payload, i18n.language);

        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.estimatePriceChanged")}
                    {detail}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isUrlChangedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>{t("product.history.events.urlChanged")}</TimelineDescription>
            </TimelineItem>
        );
    }

    if (isImagesChangedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.imagesChanged", { count: event.payload.imageCount })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isAuctionTimeChangedEvent(event)) {
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.auctionTimeChanged")}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isOriginYearChangedEvent(event)) {
        const yearLabel = formatOriginYear(
            event.payload.originYear,
            event.payload.originYearMin,
            event.payload.originYearMax,
            t,
        );

        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.originYearChanged")}
                    {` • ${yearLabel}`}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isAuthenticityChangedEvent(event)) {
        const config = AUTHENTICITY_TRANSLATION_CONFIG[event.payload.authenticity];
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.authenticityChanged", {
                        value: t(config.translationKey),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isConditionChangedEvent(event)) {
        const config = CONDITION_TRANSLATION_CONFIG[event.payload.condition];
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.conditionChanged", {
                        value: t(config.translationKey),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isProvenanceChangedEvent(event)) {
        const config = PROVENANCE_TRANSLATION_CONFIG[event.payload.provenance];
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.provenanceChanged", {
                        value: t(config.translationKey),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    if (isRestorationChangedEvent(event)) {
        const config = RESTORATION_TRANSLATION_CONFIG[event.payload.restoration];
        return (
            <TimelineItem>
                <TimelineHeader>
                    {timeBlock}
                    <TimelineTitle>{t("product.history.filters.details")}</TimelineTitle>
                </TimelineHeader>
                <TimelineDescription>
                    {t("product.history.events.restorationChanged", {
                        value: t(config.translationKey),
                    })}
                </TimelineDescription>
            </TimelineItem>
        );
    }

    return null;
}
