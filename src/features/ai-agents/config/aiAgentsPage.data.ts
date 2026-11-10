/** The public MCP server people paste into their assistant. Kept literal: it is never translated. */
export const MCP_SERVER_URL = "https://mcp.aura-historia.com/v1";

/** Anchors of the page's chapters, linked from the hero's "On this page" row. */
export const AI_AGENTS_SECTION_IDS = {
    capabilities: "what-it-can-do",
    connect: "connect",
    account: "your-account",
} as const;

export type AiAgentsSectionId = (typeof AI_AGENTS_SECTION_IDS)[keyof typeof AI_AGENTS_SECTION_IDS];

/** What an assistant can do, without and with sign-in; keys under `aiAgentsPage.capabilities`. */
export const CAPABILITY_GROUPS = [
    {
        id: "public",
        items: ["search", "listing", "similar", "auctions", "providers"],
    },
    {
        id: "signedIn",
        items: ["watchlist", "alerts", "notifications", "profile"],
    },
] as const;

/** Example requests; `signedIn` marks one that needs an account. */
export const EXAMPLE_REQUESTS = [
    { id: "meissen", signedIn: false },
    { id: "auctions", signedIn: false },
    { id: "history", signedIn: false },
    { id: "alert", signedIn: true },
] as const;

/** The four parts of an account that one sign-in approval covers, each to read and to change. */
export const SIGN_IN_SCOPES = ["profile", "alerts", "watchlist", "notifications"] as const;

export type AssistantId = "claude" | "chatgpt" | "gemini" | "grok" | "muse";

export interface AssistantSetup {
    readonly id: AssistantId;
    /** The product name, shown untranslated. */
    readonly name: string;
    /** Steps under `aiAgentsPage.connect.assistants.<id>.steps`; empty while only our app is planned. */
    readonly steps: readonly string[];
    /** The step whose body is followed by the server address with a Copy button. */
    readonly addressStep?: string;
}

/**
 * The connect tabs: assistants people can set up themselves today first, then those for which only our
 * own app is in development (the partner program page lists the same apps). An assistant without steps shows the
 * "on its way" panel. Each panel has the anchor `connect-<anchor>` so a directory listing can link it.
 */
export const ASSISTANT_SETUPS: readonly AssistantSetup[] = [
    {
        id: "claude",
        name: "Claude",
        steps: ["settings", "paste", "signIn", "ask"],
        addressStep: "paste",
    },
    {
        id: "chatgpt",
        name: "ChatGPT",
        steps: ["developerMode", "paste", "signIn", "ask"],
        addressStep: "paste",
    },
    { id: "gemini", name: "Gemini", steps: [] },
    { id: "grok", name: "Grok", steps: [] },
    { id: "muse", name: "Muse", steps: [] },
];

export const DEFAULT_ASSISTANT: AssistantId = "claude";

/** The URL fragment that selects an assistant's tab, e.g. `#connect-chatgpt`. */
export function assistantPanelAnchor(id: AssistantId): string {
    return `connect-${id}`;
}

export function assistantFromHash(hash: string): AssistantId | undefined {
    const anchor = hash.replace(/^#/, "");
    return ASSISTANT_SETUPS.find((assistant) => assistantPanelAnchor(assistant.id) === anchor)?.id;
}
