import {
    createStartHandler,
    defaultStreamHandler,
    type RequestHandler,
} from "@tanstack/react-start/server";
import type { Register } from "@tanstack/react-router";
import { applySecurityHeaders } from "@/lib/server/securityHeaders.ts";

const defaultFetch = createStartHandler(defaultStreamHandler);

const fetch: RequestHandler<Register> = async (...args) => {
    const response = await defaultFetch(...args);
    applySecurityHeaders(response.headers);

    return response;
};

export default { fetch };
