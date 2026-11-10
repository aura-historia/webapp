import { describe, expect, it } from "vitest";

import {
    ASSISTANT_SETUPS,
    assistantFromHash,
    assistantPanelAnchor,
} from "@/features/ai-agents/config/aiAgentsPage.data.ts";

describe("aiAgentsPage data", () => {
    it("lists the assistants people can set up first, then the apps in development", () => {
        expect(ASSISTANT_SETUPS.map((assistant) => assistant.id)).toEqual([
            "claude",
            "chatgpt",
            "gemini",
            "grok",
            "muse",
        ]);
        expect(
            ASSISTANT_SETUPS.filter((assistant) => assistant.steps.length > 0).map(
                (assistant) => assistant.id,
            ),
        ).toEqual(["claude", "chatgpt"]);
    });

    it("marks the step that shows the address only among an assistant's own steps", () => {
        for (const assistant of ASSISTANT_SETUPS) {
            if (assistant.addressStep) expect(assistant.steps).toContain(assistant.addressStep);
        }
    });

    it("maps a panel fragment back to its assistant", () => {
        expect(assistantPanelAnchor("chatgpt")).toBe("connect-chatgpt");
        expect(assistantFromHash("#connect-grok")).toBe("grok");
        expect(assistantFromHash("connect-claude")).toBe("claude");
        expect(assistantFromHash("#connect")).toBeUndefined();
        expect(assistantFromHash("")).toBeUndefined();
    });
});
