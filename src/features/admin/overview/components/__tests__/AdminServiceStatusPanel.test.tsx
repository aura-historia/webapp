import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import testI18n from "@/i18n/i18nForTests";
import type { ServiceStatus } from "@/features/service-status/hooks/useServiceStatus.ts";
import { AdminServiceStatusPanel } from "../AdminServiceStatusPanel.tsx";

const hook = vi.hoisted(() => ({ useServiceStatus: vi.fn() }));
vi.mock("@/features/service-status/hooks/useServiceStatus.ts", () => ({
    useServiceStatus: hook.useServiceStatus,
}));

const t = testI18n.t.bind(testI18n);
const check = vi.fn();

function renderWith(status: Partial<ServiceStatus>) {
    hook.useServiceStatus.mockReturnValue({
        result: undefined,
        isChecking: false,
        check,
        ...status,
    });
    render(<AdminServiceStatusPanel language="de" />);
    return screen.getByRole("region", { name: t("adminOverview.serviceStatus.title") });
}

function probeRow(panel: HTMLElement, labelKey: string) {
    return within(panel).getByText(t(labelKey)).closest("div") as HTMLElement;
}

describe("AdminServiceStatusPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows the visitor-facing outcome and each probe's response", () => {
        const panel = renderWith({
            result: {
                availability: "disruption",
                snapshot: {
                    liveness: { httpStatus: 200, latencyMs: 84 },
                    readiness: { httpStatus: null, latencyMs: 10_000 },
                },
                checkedAt: Date.UTC(2026, 9, 9, 12, 30, 5),
            },
        });

        expect(
            within(panel).getByText(t("adminOverview.serviceStatus.availability.disruption")),
        ).toBeTruthy();
        expect(
            within(panel).getByText(t("adminOverview.serviceStatus.visitorNotice.disruption")),
        ).toBeTruthy();

        const liveness = probeRow(panel, "adminOverview.serviceStatus.probes.liveness");
        expect(liveness).toHaveTextContent("GET /api/v1/health");
        expect(liveness).toHaveTextContent(t("adminOverview.serviceStatus.probeStates.available"));
        expect(liveness).toHaveTextContent("HTTP 200 · 84 ms");

        const readiness = probeRow(panel, "adminOverview.serviceStatus.probes.readiness");
        expect(readiness).toHaveTextContent("GET /api/v1/ready");
        expect(readiness).toHaveTextContent(
            t("adminOverview.serviceStatus.probeStates.unavailable"),
        );
        expect(readiness).toHaveTextContent(
            `${t("adminOverview.serviceStatus.noResponse")} · 10.000 ms`,
        );
    });

    it("labels a liveness 503 as maintenance", () => {
        const panel = renderWith({
            result: {
                availability: "maintenance",
                snapshot: {
                    liveness: { httpStatus: 503, latencyMs: 30 },
                    readiness: { httpStatus: 503, latencyMs: 30 },
                },
                checkedAt: 1,
            },
        });

        expect(probeRow(panel, "adminOverview.serviceStatus.probes.liveness")).toHaveTextContent(
            t("adminOverview.serviceStatus.probeStates.maintenance"),
        );
        expect(probeRow(panel, "adminOverview.serviceStatus.probes.readiness")).toHaveTextContent(
            t("adminOverview.serviceStatus.probeStates.unavailable"),
        );
    });

    it("shows a loading state before the first check settles", () => {
        const panel = renderWith({ isChecking: true });

        expect(within(panel).getByText(t("adminOverview.serviceStatus.loading"))).toBeTruthy();
        expect(within(panel).queryByText(/HTTP/)).toBeNull();
        expect(
            within(panel).getByRole("button", { name: t("adminOverview.serviceStatus.check") }),
        ).toBeDisabled();
    });

    it("rechecks on demand", async () => {
        const panel = renderWith({
            result: {
                availability: "operational",
                snapshot: {
                    liveness: { httpStatus: 200, latencyMs: 12 },
                    readiness: { httpStatus: 204, latencyMs: 25 },
                },
                checkedAt: 1,
            },
        });

        await userEvent.click(
            within(panel).getByRole("button", { name: t("adminOverview.serviceStatus.check") }),
        );

        expect(check).toHaveBeenCalledTimes(1);
    });
});
