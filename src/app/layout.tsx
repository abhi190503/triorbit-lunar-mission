import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#080F20",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "TriOrbit — Lunar Survival Simulator",
  description:
    "Junior Astronaut Mission Trainer for NASA Space Apps Challenge 2026. Manage vital resources across 5 simulated lunar days.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-space-deep text-moon-white">
      <body className="min-h-full flex flex-col font-sans antialiased bg-space-deep text-moon-white selection:bg-cyan-electric selection:text-space-deep">
        {children}
      </body>
    </html>
  );
}
