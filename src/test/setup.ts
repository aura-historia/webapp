import "@testing-library/jest-dom";

// Mock ResizeObserver which is not available in JSDOM
class ResizeObserverMock {
    observe() {}

    unobserve() {}

    disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

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
