import { useEffect, useState } from "react";

/**
 * Whether a media query matches. Reports `false` until after mount, so server markup and the
 * first client render agree; use it for behaviour, and CSS for layout.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        const update = () => setMatches(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, [query]);

    return matches;
}
