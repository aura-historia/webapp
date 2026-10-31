import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [viteReact()],
    resolve: {
        tsconfigPaths: true,
        alias: {
            // The Workers runtime module exists only in workerd; tests use a stand-in.
            "cloudflare:workers": fileURLToPath(
                new URL("./src/test/cloudflareWorkersStub.ts", import.meta.url),
            ),
        },
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.ts"],
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/cypress/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
            "**/e2e/**",
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html", "lcov"],
            reportsDirectory: "./coverage",
            exclude: [
                "node_modules/",
                "src/test/",
                "**/*.d.ts",
                "**/*.config.*",
                "**/*.test.*",
                "**/*.spec.*",
                "**/routeTree.gen.ts",
                ".output/",
                ".tanstack/",
                "src/components/ui/",
                "src/client/",
                "src/assets/",
                "e2e/",
            ],
        },
    },
});
