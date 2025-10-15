import "@testing-library/jest-dom";

// Mock ResizeObserver which is not available in JSDOM
class ResizeObserverMock {
    observe() {
        // No-op
    }

    unobserve() {
        // No-op
    }

    disconnect() {
        // No-op
    }
}

globalThis.ResizeObserver = ResizeObserverMock;

// Mock pointer capture methods which are not available in JSDOM but used by Radix UI
if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
}

if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
}

vi.mock("react-i18next", () => ({
    useTranslation: () => {
        return {
            t: (i18nKey: string) => i18nKey,
            i18n: {
                changeLanguage: () => Promise.resolve(),
            },
        };
    },
    initReactI18next: {
        type: "3rdParty",
        init: () => {},
    },
}));
