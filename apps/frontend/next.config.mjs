/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    esmExternals: 'loose',
  },
  // StrictMode deaktivieren, um Probleme mit Realtime-Subscriptions zu beheben
  reactStrictMode: false,
};

export default config;