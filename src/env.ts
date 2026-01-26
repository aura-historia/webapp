import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        SERVER_URL: z.string().url().optional(),
    },

    /**
     * The prefix that client-side variables must have. This is enforced both at
     * a type-level and at runtime.
     */
    clientPrefix: "VITE_",

    client: {
        VITE_APP_TITLE: z.string().min(1).optional(),
        VITE_API_URL: z.url().optional(),

        VITE_USER_POOL_ID: z.string().min(1),
        VITE_CLIENT_ID: z.string().min(1),

        // Feature flags - default to enabled if not set
        VITE_FEATURE_LOGIN_ENABLED: z
            .string()
            .optional()
            .default("false")
            .transform((val) => val !== "false"),
        VITE_FEATURE_SEARCH_ENABLED: z
            .string()
            .optional()
            .default("true")
            .transform((val) => val !== "false"),
    },

    /**
     * What object holds the environment variables at runtime. This is usually
     * `process.env` or `import.meta.env`.
     */
    runtimeEnv: import.meta.env,

    /**
     * By default, this library will feed the environment variables directly to
     * the Zod validator.
     *
     * This means that if you have an empty string for a value that is supposed
     * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
     * it as a type mismatch violation. Additionally, if you have an empty string
     * for a value that is supposed to be a string with a default value (e.g.
     * `DOMAIN=` in an ".env" file), the default value will never be applied.
     *
     * In order to solve these issues, we recommend that all new projects
     * explicitly specify this option as true.
     */
    emptyStringAsUndefined: true,
});
