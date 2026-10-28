import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type ParseError, parse } from "jsonc-parser";
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
    readonly compatibility_date?: string;
    readonly compatibility_flags?: string[];
    readonly vars?: Record<string, string>;
    readonly env?: Record<string, WorkerConfig>;
}

const wranglerConfigErrors: ParseError[] = [];
const wranglerConfig = parse(
    readFileSync(resolve(process.cwd(), "wrangler.jsonc"), "utf8"),
    wranglerConfigErrors,
    { allowTrailingComma: true },
) as WorkerConfig;
// Staging deploys the top level. Production deploys `env.production`, which takes its own vars:
// wrangler does not inherit vars into environments.
const stagingConfig = wranglerConfig;
const productionConfig = wranglerConfig.env?.production;
const ciWorkflow = readFileSync(resolve(process.cwd(), ".github/workflows/ci.yml"), "utf8");

function getCiJob(jobId: string): string {
    const lines = ciWorkflow.split("\n");
    const start = lines.indexOf(`    ${jobId}:`);
    expect(start).toBeGreaterThan(-1);
    const end = lines.findIndex((line, index) => index > start && /^ {4}\S/.test(line));
    return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

describe("WooCommerce OAuth broker deployment config", () => {
    it("parses wrangler.jsonc", () => {
        expect(wranglerConfigErrors).toEqual([]);
    });

    it("configures a canonical OAuthClient ID for staging", () => {
        expect(stagingConfig.name).toBe("aura-historia-staging");
        expect(stagingConfig.vars?.[CLIENT_ID_VAR]).toMatch(OAUTH_CLIENT_ID_PATTERN);
        expect(stagingConfig.vars?.[CLIENT_ID_VAR]).not.toBe(PRODUCTION_CLIENT_ID);
    });

    it("configures the registered production client for the production Worker", () => {
        expect(productionConfig?.name).toBe("aura-historia");
        expect(productionConfig?.vars?.[CLIENT_ID_VAR]).toBe(PRODUCTION_CLIENT_ID);
        expect(PRODUCTION_CLIENT_ID).toMatch(OAUTH_CLIENT_ID_PATTERN);
    });

    it("builds and uploads production releases with the production environment only", () => {
        expect(getCiJob("deploy-production")).toMatch(/^ {12}CLOUDFLARE_ENV: production$/m);
        expect(getCiJob("deploy-staging")).not.toContain("CLOUDFLARE_ENV");
        expect(getCiJob("build")).not.toContain("CLOUDFLARE_ENV");
    });
});
