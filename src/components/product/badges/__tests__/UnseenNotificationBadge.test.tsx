import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UnseenNotificationBadge } from "../UnseenNotificationBadge.tsx";

describe("UnseenNotificationBadge", () => {
    it("should render badge with 'Neu' text", () => {
        render(<UnseenNotificationBadge />);

        expect(screen.getByText("Neu")).toBeInTheDocument();
    });

    it("should render with data-testid 'unseen-notification-badge'", () => {
        render(<UnseenNotificationBadge />);

        expect(screen.getByTestId("unseen-notification-badge")).toBeInTheDocument();
    });

    it("should render sparkles icon", () => {
        const { container } = render(<UnseenNotificationBadge />);

        const sparklesIcon = container.querySelector(".lucide-sparkles");
        expect(sparklesIcon).toBeInTheDocument();
    });
});
