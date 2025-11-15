import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthPulse Pro - Clinical Intelligence Platform",
  description: "AI-powered clinical decision support and patient management system",
  icons: {
    icon: [
      { url: '/favicon.jpg', sizes: '32x32', type: 'image/jpg' },
    ],
    apple: [
      { url: '/favicon.jpg', sizes: '180x180', type: 'image/jpg' },
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
