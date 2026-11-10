import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    AI_AGENTS_SECTION_IDS,
    MCP_SERVER_URL,
} from "@/features/ai-agents/config/aiAgentsPage.data.ts";
import { AiAgentsPage } from "@/features/ai-agents/pages/AiAgentsPage";
import { renderWithRouter } from "@/test/utils";

const mocks = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));

async function renderPage() {
    await act(async () => {
        renderWithRouter(<AiAgentsPage />);
    });
}

function mockClipboard(writeText: (text: string) => Promise<void>) {
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: vi.fn(writeText) },
    });
    return navigator.clipboard.writeText as ReturnType<typeof vi.fn>;
}

describe("AiAgentsPage", () => {
    beforeEach(() => {
        window.location.hash = "";
        mocks.toastError.mockReset();
    });

    afterEach(() => {
        window.location.hash = "";
    });

    it("renders the hero, the server address and the chapters in order", async () => {
        await renderPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Den Markt durchsuchen, mit Ihrem KI-Assistenten.",
            }),
        ).toBeInTheDocument();
        expect(screen.getAllByText(MCP_SERVER_URL).length).toBeGreaterThan(0);
        expect(
            screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
        ).toEqual([
            "Ihr Assistent, unser Katalog.",
            "In wenigen Schritten verbunden.",
            "Angemeldet, wie Sie es wollen.",
            "Wir helfen beim Finden. Sie kaufen beim Anbieter.",
        ]);
    });

    it("links every chapter from the hero navigation", async () => {
        await renderPage();

        const navigation = screen.getByRole("navigation", { name: "Auf dieser Seite" });
        expect(
            within(navigation)
                .getAllByRole("link")
                .map((link) => link.getAttribute("href")),
        ).toEqual(Object.values(AI_AGENTS_SECTION_IDS).map((id) => `#${id}`));
        for (const id of Object.values(AI_AGENTS_SECTION_IDS)) {
            expect(document.getElementById(id)).toBeInTheDocument();
        }
    });

    it("keeps every assistant's panel in the markup and shows Claude first", async () => {
        await renderPage();

        const tabs = screen.getAllByRole("tab");
        expect(tabs.map((tab) => tab.textContent)).toEqual([
            "Claude",
            "ChatGPT",
            "GeminiBald, bald verfügbar",
            "GrokBald, bald verfügbar",
            "MuseBald, bald verfügbar",
        ]);
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        for (const id of ["claude", "chatgpt", "gemini", "grok", "muse"]) {
            expect(document.getElementById(`connect-${id}`)).toBeInTheDocument();
        }
        expect(document.getElementById("connect-claude")).not.toHaveAttribute("hidden");
        expect(document.getElementById("connect-chatgpt")).toHaveAttribute("hidden");

        const steps = within(screen.getByRole("list", { name: "Schritte für Claude" }));
        expect(steps.getAllByRole("listitem")).toHaveLength(4);
    });

    it("switches tabs by click and with the arrow keys", async () => {
        await renderPage();

        fireEvent.click(screen.getByRole("tab", { name: "ChatGPT" }));
        expect(screen.getByRole("tab", { name: "ChatGPT" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(document.getElementById("connect-chatgpt")).not.toHaveAttribute("hidden");

        fireEvent.keyDown(screen.getByRole("tab", { name: "ChatGPT" }), { key: "ArrowRight" });
        const gemini = screen.getByRole("tab", { name: /^Gemini/ });
        expect(gemini).toHaveAttribute("aria-selected", "true");
        expect(gemini).toHaveFocus();

        fireEvent.keyDown(gemini, { key: "Home" });
        expect(screen.getByRole("tab", { name: "Claude" })).toHaveFocus();

        fireEvent.keyDown(screen.getByRole("tab", { name: "Claude" }), { key: "End" });
        expect(screen.getByRole("tab", { name: /^Muse/ })).toHaveAttribute("aria-selected", "true");

        fireEvent.keyDown(screen.getByRole("tab", { name: /^Muse/ }), { key: "ArrowRight" });
        expect(screen.getByRole("tab", { name: "Claude" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
    });

    it("shows an app in development without steps and points to Claude and ChatGPT", async () => {
        await renderPage();

        fireEvent.click(screen.getByRole("tab", { name: /^Grok/ }));
        const panel = within(document.getElementById("connect-grok") as HTMLElement);
        expect(panel.getByText("Unsere App für Grok ist", { exact: false })).toBeInTheDocument();
        expect(panel.queryByRole("list")).not.toBeInTheDocument();

        fireEvent.click(panel.getByRole("button", { name: "ChatGPT" }));
        expect(screen.getByRole("tab", { name: "ChatGPT" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
    });

    it("selects the assistant named in the URL fragment after mount", async () => {
        window.location.hash = "#connect-chatgpt";
        Element.prototype.scrollIntoView = vi.fn();

        await renderPage();

        expect(screen.getByRole("tab", { name: "ChatGPT" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
    });

    it("follows a fragment change after mount", async () => {
        Element.prototype.scrollIntoView = vi.fn();
        await renderPage();

        await act(async () => {
            window.location.hash = "#connect-muse";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        });

        expect(screen.getByRole("tab", { name: /^Muse/ })).toHaveAttribute("aria-selected", "true");
    });

    it("shows the error when the browser has no clipboard", async () => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
        await renderPage();

        const [heroCopy] = screen.getAllByRole("button", { name: "Adresse kopieren" });
        await act(async () => {
            fireEvent.click(heroCopy);
        });

        expect(mocks.toastError).toHaveBeenCalledTimes(1);
    });

    it("copies the address and confirms it", async () => {
        const writeText = mockClipboard(() => Promise.resolve());
        await renderPage();

        const [heroCopy] = screen.getAllByRole("button", { name: "Adresse kopieren" });
        await act(async () => {
            fireEvent.click(heroCopy);
        });

        expect(writeText).toHaveBeenCalledWith(MCP_SERVER_URL);
        expect(screen.getAllByRole("button", { name: "Adresse kopiert" })).toHaveLength(1);
        expect(
            screen.getAllByRole("status").filter((region) => region.textContent !== ""),
        ).toHaveLength(1);
        expect(mocks.toastError).not.toHaveBeenCalled();
    });

    it("selects the address and shows an error when the clipboard is refused", async () => {
        mockClipboard(() => Promise.reject(new Error("denied")));
        await renderPage();

        const [heroCopy] = screen.getAllByRole("button", { name: "Adresse kopieren" });
        await act(async () => {
            fireEvent.click(heroCopy);
        });

        expect(mocks.toastError).toHaveBeenCalledWith("Kopieren nicht möglich", {
            description:
                "Ihr Browser hat die Zwischenablage blockiert. Markieren Sie den Text und kopieren Sie ihn selbst.",
        });
        expect(window.getSelection()?.toString()).toBe(MCP_SERVER_URL);
    });

    it("links to connected apps, the privacy policy, search and the agent documents", async () => {
        await renderPage();

        expect(screen.getByRole("link", { name: /Verbundene Apps öffnen/ })).toHaveAttribute(
            "href",
            "/de/partners/access-tokens#partner-connected-apps",
        );
        expect(screen.getByRole("link", { name: "Datenschutzhinweisen" })).toHaveAttribute(
            "href",
            "/de/privacy",
        );
        expect(screen.getByRole("link", { name: /Den Markt durchsuchen/ })).toHaveAttribute(
            "href",
            "/de/search",
        );
        expect(screen.getByRole("link", { name: "auth.md" })).toHaveAttribute("href", "/auth.md");
        expect(screen.getByRole("link", { name: "llms.txt" })).toHaveAttribute("href", "/llms.txt");
    });
});
