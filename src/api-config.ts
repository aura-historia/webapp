import { client } from "./client/client.gen";
import { fetchAuthSession } from "@aws-amplify/auth";
import { env } from "@/env.ts";
import { getAuthToken } from "@/lib/server/amplify.ts";

client.setConfig({
    baseUrl: env.VITE_API_URL ?? "https://api.dev.aura-historia.com",
    auth: async () => {
        if (import.meta.env.SSR) {
            return await getAuthToken();
        } else {
            const session = await fetchAuthSession();
            return session.tokens?.accessToken.toString();
        }
    },
});
