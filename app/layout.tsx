import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthPulse Pro - Clinical Intelligence Platform",
  description: "AI-powered clinical decision support and patient management system",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
