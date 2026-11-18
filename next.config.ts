import { existsSync } from "node:fs";
import { join } from "node:path";

import type { NextConfig } from "next";

import { LEGACY_ENV_FILES, legacyEnvFilesError } from "./scripts/lib/migrate-env";

// Story 1.13 (7ª rodada): um `.env.production.local` esquecido faria o app local
// usar o banco e os segredos de produção; o Next já o carregou antes deste
// arquivo, então a única saída segura é não subir.
const legacyEnvError = legacyEnvFilesError(
  LEGACY_ENV_FILES.filter((file) => existsSync(join(process.cwd(), file))),
);
if (legacyEnvError) {
  throw new Error(`Caderninho não sobe: ${legacyEnvError}`);
}

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
