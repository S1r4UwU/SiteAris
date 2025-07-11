/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Supprimer l'option experimental.optimizeCss qui peut causer des problèmes
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig; 