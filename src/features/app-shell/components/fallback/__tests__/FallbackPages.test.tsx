import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "@/test/utils.tsx";
import { ErrorPage } from "../ErrorPage.tsx";
import { NotFoundPage } from "../NotFoundPage.tsx";

const invalidate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-router")>();
    return {
        ...actual,
        useRouter: () => ({ ...actual.useRouter(), invalidate }),
    };
});

describe("NotFoundPage", () => {
    it("names the missing page under the 404 eyebrow", async () => {
        await act(async () => renderWithRouter(<NotFoundPage />));

        expect(screen.getByText("Fehler 404")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 1, name: "Seite nicht gefunden." }),
        ).toBeInTheDocument();
        expect(screen.getAllByTestId("fallback-icon")).toHaveLength(2);
    });

    it("links to the search and the homepage", async () => {
        await act(async () => renderWithRouter(<NotFoundPage />));

        expect(screen.getByRole("link", { name: "Objekte suchen" }).getAttribute("href")).toMatch(
            /^\/de\/search(\?|$)/,
        );
        expect(screen.getByRole("link", { name: "Zur Startseite" }).getAttribute("href")).toBe(
            "/de",
        );
    });
});

describe("ErrorPage", () => {
    beforeEach(() => {
        invalidate.mockReset();
    });

    it("explains the failure and offers a retry and the homepage", async () => {
        await act(async () => renderWithRouter(<ErrorPage reset={vi.fn()} />));

        expect(screen.getByText("Unerwarteter Fehler")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 1, name: "Etwas ist schiefgelaufen." }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Zur Startseite" })).toBeInTheDocument();
    });

    it("reloads the failed routes, shows progress meanwhile and then resets the boundary", async () => {
        let finish: () => void = () => {};
        invalidate.mockReturnValue(
            new Promise<void>((resolve) => {
                finish = resolve;
            }),
        );
        const reset = vi.fn();
        await act(async () => renderWithRouter(<ErrorPage reset={reset} />));

        fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));

        const pending = await screen.findByRole("button", { name: "Wird erneut versucht…" });
        expect(pending).toHaveAttribute("aria-disabled", "true");
        fireEvent.click(pending);
        expect(invalidate).toHaveBeenCalledTimes(1);
        expect(reset).not.toHaveBeenCalled();

        await act(async () => finish());

        expect(reset).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeInTheDocument();
    });
});
