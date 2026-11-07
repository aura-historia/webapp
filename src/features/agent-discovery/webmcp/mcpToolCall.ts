/** The MCP revision of every call; the backend needs no `initialize` step for it. */
export const MCP_PROTOCOL_VERSION = "2026-07-28";
/** The Streamable HTTP endpoint below the MCP origin. */
export const MCP_ENDPOINT_PATH = "/v1";

const CLIENT_INFO = { name: "aura-historia-webmcp", version: "1.0.0" } as const;
const INVALID_PARAMS = -32602;

/** Base class of every failed tool call; `toolName` is the backend tool that was called. */
export class McpCallError extends Error {
    override name = "McpCallError";

    constructor(
        readonly toolName: string,
        message: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}

/** The tool ran and reported a failure (`isError`), such as `NOT_FOUND`. */
export class McpToolError extends McpCallError {
    override name = "McpToolError";

    constructor(
        toolName: string,
        readonly toolError: string,
    ) {
        super(toolName, `${toolName} failed: ${toolError}`);
    }
}

/** JSON-RPC `-32602`: an unknown tool or invalid arguments, as after an unsynced backend change. */
export class McpInvalidParamsError extends McpCallError {
    override name = "McpInvalidParamsError";

    constructor(toolName: string, detail: string) {
        super(
            toolName,
            `${toolName} rejected the call as an unknown tool or invalid arguments: ${detail}`,
        );
    }
}

/** Any other JSON-RPC error, such as a rejected protocol header or an internal failure. */
export class McpProtocolError extends McpCallError {
    override name = "McpProtocolError";

    constructor(
        toolName: string,
        readonly code: number,
        detail: string,
    ) {
        super(toolName, `${toolName} failed with MCP error ${code}: ${detail}`);
    }
}

/** No JSON-RPC response arrived: a network or CORS failure, or an HTTP error without a body. */
export class McpTransportError extends McpCallError {
    override name = "McpTransportError";

    constructor(
        toolName: string,
        readonly status: number | undefined,
        options?: ErrorOptions,
    ) {
        const suffix = status === undefined ? "" : ` (HTTP ${status})`;
        super(toolName, `${toolName} could not reach Aura Historia's MCP server${suffix}`, options);
    }
}

let nextRequestId = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function abortReasonOr(signal: AbortSignal | undefined, error: unknown): unknown {
    return signal?.aborted ? signal.reason : error;
}

function readToolError(result: Record<string, unknown>): string {
    const content = Array.isArray(result.content) ? result.content : [];
    const text = content
        .filter(isRecord)
        .filter((block) => block.type === "text" && typeof block.text === "string")
        .map((block) => block.text as string)
        .join("\n");
    return text || "unknown error";
}

function readResponse(toolName: string, response: Response, message: unknown): unknown {
    if (!isRecord(message) || message.jsonrpc !== "2.0") {
        throw new McpTransportError(toolName, response.status);
    }

    if (isRecord(message.error)) {
        const { code } = message.error;
        const detail = typeof message.error.message === "string" ? message.error.message : "";
        if (code === INVALID_PARAMS) {
            throw new McpInvalidParamsError(toolName, detail);
        }
        throw new McpProtocolError(toolName, typeof code === "number" ? code : Number.NaN, detail);
    }

    const { result } = message;
    if (!response.ok || !isRecord(result)) {
        throw new McpTransportError(toolName, response.status);
    }
    if (result.isError === true) {
        throw new McpToolError(toolName, readToolError(result));
    }
    if (!("structuredContent" in result)) {
        throw new McpTransportError(toolName, response.status);
    }
    return result.structuredContent;
}

/**
 * Sends one anonymous `tools/call` to the MCP endpoint and resolves with the result's
 * `structuredContent`. Requests carry no cookies or credentials.
 */
export async function callMcpTool(
    endpoint: string,
    toolName: string,
    input: unknown,
    signal?: AbortSignal,
): Promise<unknown> {
    const body = JSON.stringify({
        jsonrpc: "2.0",
        id: nextRequestId++,
        method: "tools/call",
        params: {
            name: toolName,
            arguments: input ?? {},
            _meta: {
                "io.modelcontextprotocol/protocolVersion": MCP_PROTOCOL_VERSION,
                "io.modelcontextprotocol/clientInfo": CLIENT_INFO,
                "io.modelcontextprotocol/clientCapabilities": {},
            },
        },
    });

    let response: Response;
    let message: unknown;
    try {
        response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Accept: "application/json, text/event-stream",
                "Content-Type": "application/json",
                "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
                "Mcp-Method": "tools/call",
                "Mcp-Name": toolName,
            },
            body,
            signal,
            credentials: "omit",
            cache: "no-store",
            redirect: "error",
        });
    } catch (error) {
        throw abortReasonOr(signal, new McpTransportError(toolName, undefined, { cause: error }));
    }

    try {
        message = JSON.parse(await response.text());
    } catch (error) {
        throw abortReasonOr(
            signal,
            new McpTransportError(toolName, response.status, { cause: error }),
        );
    }

    return readResponse(toolName, response, message);
}
