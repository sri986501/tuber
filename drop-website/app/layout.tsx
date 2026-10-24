import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050B18",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | DROP",
    default: "DROP — Small Steps. Big Ideas.",
  },
  description:
    "DROP is an emerging student-led creative technology project exploring ideas through software, connected systems, and digital experiences.",
  keywords: [
    "creative technology",
    "student project",
    "IoT",
    "software engineering",
    "creative coding",
    "open source",
    "digital experiences",
  ],
  authors: [{ name: "DROP Creative Technology Lab" }],
  creator: "DROP Student Team",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://drop.example.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DROP",
    title: "DROP — Small Steps. Big Ideas.",
    description:
      "A student-led creative technology initiative exploring software, connected systems, and digital experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DROP — Small Steps. Big Ideas.",
    description:
      "A student-led creative technology initiative exploring software, connected systems, and digital experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <body className="bg-drop-navy text-drop-white min-h-screen flex flex-col antialiased selection:bg-drop-cyan selection:text-drop-navy">
        {/* Accessibility Skip Link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Global Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}
