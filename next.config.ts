import type { NextConfig } from "next";

// Content Security Policy.
//
// `connect-src` stays broad (https:/wss:) because the VAPI client negotiates
// WebRTC and websockets with providers whose edges change. Everything that can
// be locked down is: no objects, no framing, same-origin forms/base, and a
// same-origin script/style baseline. A nonce-based script policy is the next
// step; it requires rendering every page dynamically.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://covers.openlibrary.org",
  "font-src 'self' data:",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https: wss: blob: data:",
  "frame-src 'self' https://*.vapi.ai",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(self), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
