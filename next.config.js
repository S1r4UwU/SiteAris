/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'cqdjelrlrdhddqyeolbb.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  env: {
    // Variables d'environnement codées en dur pour le développement
    NEXT_PUBLIC_SUPABASE_URL: 'https://cqdjelrlrdhddqyeolbb.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZGplbHJscmRoZGRxeWVvbGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzM2NjIsImV4cCI6MjA2NjUwOTY2Mn0.LIzmNxCYpBYmyUZ7L2vz-8Qg0Laz1Pqf_OG9dIP3Tqk',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    return config;
  },
};

module.exports = nextConfig; 