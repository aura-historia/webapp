/** Whether response headers describe an HTML page, ignoring media type parameters and case. */
export function isHtmlResponse(headers: Headers): boolean {
    const mediaType = headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
    return mediaType === "text/html";
}
