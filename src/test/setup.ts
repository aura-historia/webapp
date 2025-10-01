import "@testing-library/jest-dom";

// Mock ResizeObserver which is not available in JSDOM
class ResizeObserverMock {
    observe() {}

    unobserve() {}

    disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;
