import { client } from "./client/client.gen";
import { fetchAuthSession } from "@aws-amplify/auth";
import { env } from "@/env.ts";

client.setConfig({
    baseUrl: env.VITE_API_URL,
    auth: async () => {
        const session = await fetchAuthSession();
        return session.tokens?.accessToken.toString();
    },
});
