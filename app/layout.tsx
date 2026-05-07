import type { Metadata } from "next";
import { Geist, Geist_Mono, Gloock } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gloock = Gloock({
  variable: "--font-gloock",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "StellarFlux — Autonomy Capital",
  description: "Thematic intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${gloock.variable} h-full dark`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased">
        {/* Apply saved theme before paint to prevent flash */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          try {
            var t = localStorage.getItem('sf-theme');
            if (t === 'light') document.documentElement.classList.remove('dark');
            else document.documentElement.classList.add('dark');
          } catch(e) {}
        `}</Script>
        {children}
      </body>
    </html>
  );
}
