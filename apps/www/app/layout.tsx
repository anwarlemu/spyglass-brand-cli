import type { Metadata } from "next";

import { registryName } from "@www/lib/registry";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://spyglass-ds.vercel.app"),
  title: { default: `${registryName} design system`, template: `%s | ${registryName} design system` },
  description: `Tokens, logos, the brand light and every component for building ${registryName} interfaces, pages and assets.`,
  icons: { icon: [{ url: "/spyglass-ds/logo/favicon.svg", type: "image/svg+xml" }, { url: "/spyglass-ds/icons/favicon-32.png", sizes: "32x32" }], apple: "/spyglass-ds/icons/apple-touch-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/spyglass-ds/fonts/DMSans.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/spyglass-ds/fonts/FunnelDisplay.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
