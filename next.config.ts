
// next.config.js
/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  start_url: "/dashboard",
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", port: "", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", port: "", pathname: "/**" },
      { protocol: "https", hostname: "i.imgur.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "lci-dash.firebasestorage.app", port: "", pathname: "/**" },
    ],
  },

  // Adiciona CORS em respostas servidas pelo Next para os caminhos relevantes
  async headers() {
    return [
      // Manifest estático no public
      {
        source: "/manifest.json",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },

      // Service worker / arquivos de PWA
      {
        source: "/sw.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-control-allow-methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },

      // Se a sua infra intercepta /_workstation/* e encaminha, tente aplicar CORS aqui também
      {
        source: "/_workstation/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS, POST" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },

      // Fallback geral para rotas do Next
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
