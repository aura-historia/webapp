import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";
import {
    formatOriginYear,
    formatOriginYearDescription,
    getOriginYearColor,
    PRODUCT_ATTRIBUTE_COLORS,
} from "@/components/product/detail/ProductQualityIndicator/ProductQualityIndicator.helpers.ts";

describe("ProductQualityIndicator.helpers", () => {
    let mockT: TFunction;

    beforeEach(() => {
        mockT = vi.fn((key: string, params?: Record<string, number>) => {
            if (params) {
                return `${key}:${JSON.stringify(params)}`;
            }
            return key;
        }) as unknown as TFunction;
    });

    describe("PRODUCT_ATTRIBUTE_COLORS", () => {
        it("should have all color mappings defined", () => {
            expect(PRODUCT_ATTRIBUTE_COLORS.condition.EXCELLENT).toBe("bg-green-700");
            expect(PRODUCT_ATTRIBUTE_COLORS.condition.UNKNOWN).toBe("bg-gray-400");
            expect(PRODUCT_ATTRIBUTE_COLORS.authenticity.ORIGINAL).toBe("bg-green-700");
            expect(PRODUCT_ATTRIBUTE_COLORS.provenance.COMPLETE).toBe("bg-green-700");
            expect(PRODUCT_ATTRIBUTE_COLORS.restoration.NONE).toBe("bg-green-700");
        });

        it("should have UNKNOWN fallback for all attributes", () => {
            expect(PRODUCT_ATTRIBUTE_COLORS.condition.UNKNOWN).toBeDefined();
            expect(PRODUCT_ATTRIBUTE_COLORS.authenticity.UNKNOWN).toBeDefined();
            expect(PRODUCT_ATTRIBUTE_COLORS.provenance.UNKNOWN).toBeDefined();
            expect(PRODUCT_ATTRIBUTE_COLORS.restoration.UNKNOWN).toBeDefined();
        });
    });

    describe("formatOriginYear", () => {
        it("should return exact year as string when originYear is provided", () => {
            const result = formatOriginYear(1850, undefined, undefined, mockT, false);
            expect(result).toBe("1850");
            expect(mockT).not.toHaveBeenCalled();
        });

        it("should return translation for range when both min and max are provided", () => {
            formatOriginYear(undefined, 1850, 1900, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.range", {
                min: 1850,
                max: 1900,
            });
        });

        it("should return translation for 'from' when only min is provided", () => {
            formatOriginYear(undefined, 1850, undefined, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.from", {
                year: 1850,
            });
        });

        it("should return translation for 'until' when only max is provided", () => {
            formatOriginYear(undefined, undefined, 1900, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.until", {
                year: 1900,
            });
        });

        it("should return translation for 'unknown' when no values are provided", () => {
            formatOriginYear(undefined, undefined, undefined, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.unknown");
        });

        it("should return translation for 'unknown' when all values are undefined", () => {
            formatOriginYear(undefined, undefined, undefined, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.unknown");
        });

        describe("with isDescription=true", () => {
            it("should use exactDescription key for exact year", () => {
                formatOriginYear(1850, undefined, undefined, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.exactDescription",
                    { year: 1850 },
                );
            });

            it("should use rangeDescription key for range", () => {
                formatOriginYear(undefined, 1850, 1900, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.rangeDescription",
                    { min: 1850, max: 1900 },
                );
            });

            it("should use fromDescription key for min only", () => {
                formatOriginYear(undefined, 1850, undefined, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.fromDescription",
                    { year: 1850 },
                );
            });

            it("should use untilDescription key for max only", () => {
                formatOriginYear(undefined, undefined, 1900, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.untilDescription",
                    { year: 1900 },
                );
            });

            it("should use unknownDescription key for no values", () => {
                formatOriginYear(undefined, undefined, undefined, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.unknownDescription",
                );
            });
        });

        it("should prioritize originYear over min/max if all are provided", () => {
            const result = formatOriginYear(1875, 1850, 1900, mockT, false);
            expect(result).toBe("1875");
            expect(mockT).not.toHaveBeenCalled();
        });
    });

    describe("formatOriginYearDescription", () => {
        it("should call formatOriginYear with isDescription=true", () => {
            formatOriginYearDescription(1850, undefined, undefined, mockT);
            expect(mockT).toHaveBeenCalledWith(
                "product.qualityIndicators.originYear.exactDescription",
                { year: 1850 },
            );
        });

        it("should handle all parameters correctly", () => {
            formatOriginYearDescription(undefined, 1850, 1900, mockT);
            expect(mockT).toHaveBeenCalledWith(
                "product.qualityIndicators.originYear.rangeDescription",
                { min: 1850, max: 1900 },
            );
        });
    });

    describe("getOriginYearColor", () => {
        it("should return BEST color when exact year is provided", () => {
            const result = getOriginYearColor(1850, undefined, undefined);
            expect(result).toBe("bg-green-700");
        });

        it("should return BEST color when exact year is provided (ignoring min/max)", () => {
            const result = getOriginYearColor(1875, 1850, 1900);
            expect(result).toBe("bg-green-700");
        });

        it("should return GOOD color when only min is provided", () => {
            const result = getOriginYearColor(undefined, 1850, undefined);
            expect(result).toBe("bg-sky-600");
        });

        it("should return GOOD color when only max is provided", () => {
            const result = getOriginYearColor(undefined, undefined, 1900);
            expect(result).toBe("bg-sky-600");
        });

        it("should return GOOD color when both min and max are provided", () => {
            const result = getOriginYearColor(undefined, 1850, 1900);
            expect(result).toBe("bg-sky-600");
        });

        it("should return UNKNOWN color when no values are provided", () => {
            const result = getOriginYearColor(undefined, undefined, undefined);
            expect(result).toBe("bg-gray-400");
        });

        it("should return UNKNOWN color when all values are undefined", () => {
            const result = getOriginYearColor(undefined, undefined, undefined);
            expect(result).toBe("bg-gray-400");
        });
    });
});
