/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Vercel'da backend va frontend bir domain'da bo'lgani uchun relative path
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "/api",
  },
};

module.exports = nextConfig;
