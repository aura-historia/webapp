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
            const result = formatOriginYear(1850, null, null, mockT, false);
            expect(result).toBe("1850");
            expect(mockT).not.toHaveBeenCalled();
        });

        it("should return translation for range when both min and max are provided", () => {
            formatOriginYear(null, 1850, 1900, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.range", {
                min: 1850,
                max: 1900,
            });
        });

        it("should return translation for 'from' when only min is provided", () => {
            formatOriginYear(null, 1850, null, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.from", {
                year: 1850,
            });
        });

        it("should return translation for 'until' when only max is provided", () => {
            formatOriginYear(null, null, 1900, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.until", {
                year: 1900,
            });
        });

        it("should return translation for 'unknown' when no values are provided", () => {
            formatOriginYear(null, null, null, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.unknown");
        });

        it("should return translation for 'unknown' when all values are undefined", () => {
            formatOriginYear(undefined, undefined, undefined, mockT, false);
            expect(mockT).toHaveBeenCalledWith("product.qualityIndicators.originYear.unknown");
        });

        describe("with isDescription=true", () => {
            it("should use exactDescription key for exact year", () => {
                formatOriginYear(1850, null, null, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.exactDescription",
                    { year: 1850 },
                );
            });

            it("should use rangeDescription key for range", () => {
                formatOriginYear(null, 1850, 1900, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.rangeDescription",
                    { min: 1850, max: 1900 },
                );
            });

            it("should use fromDescription key for min only", () => {
                formatOriginYear(null, 1850, null, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.fromDescription",
                    { year: 1850 },
                );
            });

            it("should use untilDescription key for max only", () => {
                formatOriginYear(null, null, 1900, mockT, true);
                expect(mockT).toHaveBeenCalledWith(
                    "product.qualityIndicators.originYear.untilDescription",
                    { year: 1900 },
                );
            });

            it("should use unknownDescription key for no values", () => {
                formatOriginYear(null, null, null, mockT, true);
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
            formatOriginYearDescription(1850, null, null, mockT);
            expect(mockT).toHaveBeenCalledWith(
                "product.qualityIndicators.originYear.exactDescription",
                { year: 1850 },
            );
        });

        it("should handle all parameters correctly", () => {
            formatOriginYearDescription(null, 1850, 1900, mockT);
            expect(mockT).toHaveBeenCalledWith(
                "product.qualityIndicators.originYear.rangeDescription",
                { min: 1850, max: 1900 },
            );
        });
    });

    describe("getOriginYearColor", () => {
        it("should return BEST color when exact year is provided", () => {
            const result = getOriginYearColor(1850, null, null);
            expect(result).toBe("bg-green-700");
        });

        it("should return BEST color when exact year is provided (ignoring min/max)", () => {
            const result = getOriginYearColor(1875, 1850, 1900);
            expect(result).toBe("bg-green-700");
        });

        it("should return GOOD color when only min is provided", () => {
            const result = getOriginYearColor(null, 1850, null);
            expect(result).toBe("bg-sky-600");
        });

        it("should return GOOD color when only max is provided", () => {
            const result = getOriginYearColor(null, null, 1900);
            expect(result).toBe("bg-sky-600");
        });

        it("should return GOOD color when both min and max are provided", () => {
            const result = getOriginYearColor(null, 1850, 1900);
            expect(result).toBe("bg-sky-600");
        });

        it("should return UNKNOWN color when no values are provided", () => {
            const result = getOriginYearColor(null, null, null);
            expect(result).toBe("bg-gray-400");
        });

        it("should return UNKNOWN color when all values are undefined", () => {
            const result = getOriginYearColor(undefined, undefined, undefined);
            expect(result).toBe("bg-gray-400");
        });
    });
});
