import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type { ServiceAvailability } from "../../lib/serviceAvailability.ts";
import { ServiceStatusBanner } from "../ServiceStatusBanner.tsx";

const hook = vi.hoisted(() => ({ useServiceStatus: vi.fn() }));
vi.mock("../../hooks/useServiceStatus.ts", () => ({ useServiceStatus: hook.useServiceStatus }));

const t = testI18n.t.bind(testI18n);

function renderWith(availability: ServiceAvailability | undefined) {
    hook.useServiceStatus.mockReturnValue({
        result: availability && {
            availability,
            snapshot: {
                liveness: { httpStatus: 200, latencyMs: 10 },
                readiness: { httpStatus: 204, latencyMs: 10 },
            },
            checkedAt: 1,
        },
        isChecking: false,
        check: vi.fn(),
    });
    render(<ServiceStatusBanner />);
}

describe("ServiceStatusBanner", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        ["before the first check settles", undefined],
        ["while operational", "operational"],
    ] as const)("keeps an empty live region %s", (_, availability) => {
        renderWith(availability);

        expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it.each(["maintenance", "disruption"] as const)("announces the %s notice", (availability) => {
        renderWith(availability);

        const status = screen.getByRole("status");
        expect(status).toHaveTextContent(t(`serviceStatus.notice.${availability}.title`));
        expect(status).toHaveTextContent(t(`serviceStatus.notice.${availability}.description`));
    });
});
