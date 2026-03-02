import { env } from "@/env";

/**
 * Absolute URL of the default Open Graph / Twitter Card banner image.
 * Used as a fallback on all pages where no product-specific image is available.
 * The file is served from /public/logo-banner-slogan.png.
 */
export const BANNER_IMAGE_URL = `${env.VITE_APP_URL}/logo-banner.png`;
