/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_DEV: process.env.WEB3_AUTH_CLIENT_ID_DEV,
    NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_PROD: process.env.WEB3_AUTH_CLIENT_ID_PROD,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;