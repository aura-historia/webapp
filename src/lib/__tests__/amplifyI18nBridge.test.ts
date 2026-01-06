import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAmplifyVocabulary, syncAmplifyTranslations } from "../amplifyI18nBridge";
import i18n from "@/i18n/i18n";
import { I18n } from "aws-amplify/utils";

// Mock dependencies
vi.mock("@/i18n/i18n", () => ({
    default: {
        t: vi.fn(),
        language: "en",
    },
}));

vi.mock("aws-amplify/utils", () => ({
    I18n: {
        putVocabularies: vi.fn(),
    },
}));

describe("amplifyI18nBridge", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getAmplifyVocabulary", () => {
        it("should map amplify keys to translated values", () => {
            // Setup mock
            const mockT = i18n.t as unknown as ReturnType<typeof vi.fn>;
            mockT.mockImplementation((key: string) => {
                if (key === "amplify.email") return "E-Mail Adresse";
                return key; // Default behavior if not translated
            });

            const vocabulary = getAmplifyVocabulary();

            expect(vocabulary.Email).toBe("E-Mail Adresse");
            expect(mockT).toHaveBeenCalledWith("amplify.email");
        });

        it("should not include keys that are not translated (return same key)", () => {
            // Setup mock
            const mockT = i18n.t as unknown as ReturnType<typeof vi.fn>;
            mockT.mockImplementation((key: string) => key); // Returns key as translation

            const vocabulary = getAmplifyVocabulary();

            // Since all translations return the key, and the code checks `translation !== i18nextKey`,
            // the vocabulary should be empty.
            expect(Object.keys(vocabulary)).toHaveLength(0);
        });
    });

    describe("syncAmplifyTranslations", () => {
        it("should call I18n.putVocabularies with correct data", () => {
            // Setup mocks
            const mockT = i18n.t as unknown as ReturnType<typeof vi.fn>;
            mockT.mockReturnValue("Translated Value");

            // We need to mock the language property getter if it's read-only,
            // but since we mocked the whole module, we can just assign it if the mock allows.
            // However, in the mock factory above we returned a simple object.
            // Let's update the mock value for this test.
            Object.defineProperty(i18n, "language", {
                value: "de",
                configurable: true,
            });

            syncAmplifyTranslations();

            expect(I18n.putVocabularies).toHaveBeenCalledWith({
                de: expect.any(Object),
            });

            // Verify the vocabulary content passed
            const callArgs = (I18n.putVocabularies as unknown as ReturnType<typeof vi.fn>).mock
                .calls[0][0];
            // Since we mocked t to return 'Translated Value', all keys in the map should be present
            expect(Object.keys(callArgs.de).length).toBeGreaterThan(0);
            expect(callArgs.de.Email).toBe("Translated Value");
        });
    });
});
