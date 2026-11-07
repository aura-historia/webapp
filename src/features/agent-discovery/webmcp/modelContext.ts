/**
 * The part of the WebMCP API (https://webmachinelearning.github.io/webmcp/) this site uses. Only
 * browsers with WebMCP, or an extension that provides it, expose a model context.
 */
export interface WebMcpToolAnnotations {
    readonly readOnlyHint?: boolean;
    /** The result carries text the site does not vouch for, such as third-party listing text. */
    readonly untrustedContentHint?: boolean;
    readonly consequentialHint?: boolean;
}

export interface WebMcpToolExecuteOptions {
    /** Aborted when the agent cancels this execution. */
    readonly signal?: AbortSignal;
}

export interface WebMcpTool {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: Readonly<Record<string, unknown>>;
    readonly annotations?: WebMcpToolAnnotations;
    /** Resolves with the value the browser serializes for the agent; a rejection fails the call. */
    readonly execute: (input: unknown, options?: WebMcpToolExecuteOptions) => Promise<unknown>;
}

export interface ModelContext {
    /**
     * Returns a promise that rejects on a duplicate name; aborting the signal unregisters the
     * tool. Older builds return nothing or throw synchronously.
     */
    registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): unknown;
    /** Older Chrome builds unregister by name and may ignore the signal. */
    unregisterTool?: (name: string) => void;
}

function isModelContext(value: unknown): value is ModelContext {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as { registerTool?: unknown }).registerTool === "function"
    );
}

/**
 * The page's model context: `document.modelContext` (current spec), else `navigator.modelContext`
 * (older Chrome builds). `undefined` without WebMCP and during server rendering.
 */
export function getModelContext(): ModelContext | undefined {
    if (typeof document === "undefined" || typeof navigator === "undefined") {
        return undefined;
    }

    const candidates: unknown[] = [
        (document as { modelContext?: unknown }).modelContext,
        (navigator as { modelContext?: unknown }).modelContext,
    ];
    return candidates.find(isModelContext);
}
