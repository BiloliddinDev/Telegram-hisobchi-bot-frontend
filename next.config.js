/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Environment variables configuration
  env: {
    // API URL configuration based on environment
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl(),
    NEXT_PUBLIC_DEBUG: process.env.NEXT_PUBLIC_DEBUG || "false",
    ADMIN_ID: process.env.ADMIN_ID || "123456789",
  },

  // Additional configuration for different environments
  ...(process.env.NODE_ENV === "production" && {
    // Production-specific optimizations
    swcMinify: true,
    compress: true,
    poweredByHeader: false,
  }),

  // Development-specific configuration
  ...(process.env.NODE_ENV === "development" && {
    // Enable source maps in development
    productionBrowserSourceMaps: false,
  }),
};

function getDefaultApiUrl() {
  // Default URL logic based on environment
  if (process.env.NODE_ENV === "production") {
    // In production, use relative path for same-domain deployment
    return "/api";
  } else {
    // In development, use localhost backend
    return "http://localhost:5000";
  }
}

module.exports = nextConfig;
