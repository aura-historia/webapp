import ReactGA from "react-ga4";
import { env } from "@/env.ts";

const TRACKING_TAG_STAGE = "G-25SPFBNNC2";
const TRACKING_TAG = "G-HL1MJKQBZR";

const isRunningInProd = env.VITE_APP_URL === "https://aura-historia.com";

ReactGA.initialize(isRunningInProd ? TRACKING_TAG : TRACKING_TAG_STAGE, {
    gtagOptions: { send_page_view: false },
});
