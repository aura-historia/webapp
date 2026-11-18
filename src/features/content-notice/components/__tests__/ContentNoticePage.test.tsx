import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ContentNoticePage } from "../../pages/ContentNoticePage.tsx";
import { ContentNoticeConfirmation } from "../ContentNoticeConfirmation.tsx";

vi.mock("@tanstack/react-router", async () => ({
    ...(await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router")),
    Link: ({ children, className }: { children: ReactNode; className?: string }) => (
        <a href="/de" className={className}>
            {children}
        </a>
    ),
}));

const listing = {
    kind: "listing",
    productListingId: "pl_1",
    productListingTitleSlugId: "vase-pl_1",
    title: "Jugendstil-Vase",
    listingSourceId: "ls_1",
    providerName: "Hartley & Finch",
    providerSlugId: "hartley-finch",
    partner: false,
} as const;

describe("ContentNoticePage", () => {
    it("asks to start from a listing or provider when the link names none", () => {
        render(<ContentNoticePage data={{ status: "missing" }} />);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Entfernung beantragen oder Inhalt melden.",
        );
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
            "Beginnen Sie beim Angebot oder Anbieter.",
        );
        expect(screen.queryByRole("form")).toBeNull();
    });

    it("says when the listing is gone", () => {
        render(<ContentNoticePage data={{ status: "notFound", kind: "listing" }} />);
        expect(screen.getByRole("alert")).toHaveTextContent("Dieses Angebot gibt es nicht mehr.");
    });
});

describe("ContentNoticeConfirmation", () => {
    it("confirms receipt at the given address without a time frame or partner programme", () => {
        render(
            <ContentNoticeConfirmation
                target={listing}
                submission={{
                    email: "marie@example.com",
                    reasonCategory: "RIGHTS_INFRINGEMENT",
                    scope: "listing",
                }}
            />,
        );
        expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
        expect(screen.getByRole("status")).toHaveTextContent(
            "Ihre Meldung ist eingegangen. Wir haben Ihnen eine Eingangsbestätigung an marie@example.com gesendet und teilen Ihnen unsere Entscheidung per E-Mail mit.",
        );
        expect(screen.getByText("Jugendstil-Vase · Hartley & Finch")).toBeInTheDocument();
        expect(screen.getByText("Rechtsverletzung")).toBeInTheDocument();
        expect(screen.queryByText(/Partner/)).toBeNull();
    });

    it("says that an anonymous report gets no confirmation or decision", () => {
        render(
            <ContentNoticeConfirmation
                target={listing}
                submission={{ reasonCategory: "ILLEGAL_CONTENT", scope: "listing" }}
            />,
        );
        expect(screen.getByRole("status")).toHaveTextContent(
            "Ihre Meldung ist eingegangen. Sie haben keine E-Mail-Adresse angegeben, daher können wir Ihnen weder den Eingang bestätigen noch unsere Entscheidung mitteilen.",
        );
        expect(screen.queryByText(/Spam-Ordner/)).toBeNull();
    });
});
