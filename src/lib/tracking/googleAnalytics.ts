import ReactGA from "react-ga4";

const TRACKING_TAG = "G-HL1MJKQBZR";

ReactGA.initialize(TRACKING_TAG, {
    gtagOptions: { send_page_view: false },
});
