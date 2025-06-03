/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["chess.js"],
  },
  // Optimize for accessibility
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Better error handling for screen readers
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Ensure proper ARIA support
  eslint: {
    dirs: ["pages", "components", "lib", "utils"],
  },
};

module.exports = nextConfig;
