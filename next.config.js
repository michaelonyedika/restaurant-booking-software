/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  transpilePackages: ["geist"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "restaurant-booking-software-mck.s3.amazonaws.com",
        pathname: "/**", // Allow all paths
      },
    ],
    // Define custom device sizes for responsive images
    deviceSizes: [320, 420, 768, 1024, 1200],
    // Define additional static image sizes for optimization
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default config;
