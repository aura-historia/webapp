import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { OAUTH_CLIENT_ID_PATTERN } from "../oauthClientRedirectBrokerHandler.ts";

vi.mock("@/env.ts", () => ({
    env: {},
}));

const CLIENT_ID_VAR = "OAUTH_CLIENT_REDIRECT_BROKER_WOOCOMMERCE_CLIENT_ID";
// The WooCommerce OAuth client registered with the production backend; recreating it breaks
// every connected store, so a release must keep using it.
const PRODUCTION_CLIENT_ID = "oc_01m5vyvraxecksre2zepjcza88";

interface WorkerConfig {
    readonly name?: string;
    readonly vars?: Record<string, string>;
    readonly env?: Record<string, WorkerConfig>;
}

// wrangler.jsonc only uses full-line comments.
const wranglerConfig = JSON.parse(
    readFileSync(resolve(process.cwd(), "wrangler.jsonc"), "utf8").replaceAll(/^\s*\/\/.*$/gm, ""),
) as WorkerConfig;
const ciWorkflow = readFileSync(resolve(process.cwd(), ".github/workflows/ci.yml"), "utf8");

function getCiJob(jobId: string): string {
    const lines = ciWorkflow.split("\n");
    const start = lines.indexOf(`    ${jobId}:`);
    expect(start).toBeGreaterThan(-1);
    const end = lines.findIndex((line, index) => index > start && /^ {4}\S/.test(line));
    return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

describe("WooCommerce OAuth broker deployment config", () => {
    it("configures a canonical OAuthClient ID for staging", () => {
        expect(wranglerConfig.name).toBe("aura-historia-staging");
        expect(wranglerConfig.vars?.[CLIENT_ID_VAR]).toMatch(OAUTH_CLIENT_ID_PATTERN);
    });

    it("configures the registered production client for the production Worker", () => {
        const production = wranglerConfig.env?.production;

        expect(production?.name).toBe("aura-historia");
        expect(production?.vars?.[CLIENT_ID_VAR]).toBe(PRODUCTION_CLIENT_ID);
        expect(PRODUCTION_CLIENT_ID).toMatch(OAUTH_CLIENT_ID_PATTERN);
        expect(wranglerConfig.vars?.[CLIENT_ID_VAR]).not.toBe(PRODUCTION_CLIENT_ID);
    });

    it("builds and uploads production releases with the production environment only", () => {
        expect(getCiJob("deploy-production")).toMatch(/^ {12}CLOUDFLARE_ENV: production$/m);
        expect(getCiJob("deploy-staging")).not.toContain("CLOUDFLARE_ENV");
        expect(getCiJob("build")).not.toContain("CLOUDFLARE_ENV");
    });
});
