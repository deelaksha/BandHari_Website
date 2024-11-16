// next.config.ts (or next.config.js for JavaScript)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['example.com','nhwyumfnwqkldeaeqbbg.supabase.co'], // Add your Supabase hostname here
  },
};

export default nextConfig; // Export the configuration correctly
