import "@testing-library/jest-dom";
import "@/i18n/i18nForTests";
import { vi } from "vitest";

// Mock the env module so tests don't require real secrets
// This is especially important for Dependabot PRs which can't access repo secrets
vi.mock("@/env", () => ({
    env: {
        VITE_USER_POOL_ID: "test-pool-id",
        VITE_CLIENT_ID: "test-client-id",
        VITE_FEATURE_LOGIN_ENABLED: true,
        VITE_FEATURE_SEARCH_ENABLED: true,
    },
}));

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

// Mock IntersectionObserver which is not available in JSDOM but used by embla-carousel
class IntersectionObserverMock {
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

globalThis.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;

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

if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
}
