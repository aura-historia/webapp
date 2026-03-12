import ReactGA from "react-ga4";

export function sendPageViewEvent(
    currentPath: string,
    language: string,
    searchParams: Record<string, unknown>,
) {
    // These shouldn't be contained - but we filter anyway to make sure we never leak them to GA
    const FORBIDDEN_PARAMS = ["token", "password", "email", "reset_key", "session_id"];
    const safeParams = Object.keys(searchParams).reduce(
        (acc, key) => {
            if (!FORBIDDEN_PARAMS.includes(key.toLowerCase())) {
                acc[key] = searchParams[key];
            }
            return acc;
        },
        {} as Record<string, unknown>,
    );

    ReactGA.send({
        hitType: "pageview",
        page: currentPath,
        language: language,
        ...safeParams,
    });
}
