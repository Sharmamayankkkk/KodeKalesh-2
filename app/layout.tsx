import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthPulse Pro - Clinical Intelligence Platform",
  description: "AI-powered clinical decision support and patient management system",
  icons: {
    icon: [
      { url: '/Logo.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/Logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
