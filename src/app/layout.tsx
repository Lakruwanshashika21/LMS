import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  // SEO: Primary tags for search engine results
  title: "Logic LMS | Dilshan Uthpala | Best Logic Classes in Sri Lanka",
  description: "Join Dilshan Uthpala's Logic classes. Access course materials, student portal, exam results, and academic resources for 2026/2027 A/L.",
  keywords: ["Logic classes", "A/L Logic", "Dilshan Uthpala", "Sri Lanka Education", "Logic LMS", "Chemistry Logic", "Education Portal"],
  
  // PWA & Manifest configuration for app installation
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Logic LMS",
  },

  // Open Graph: Controls how the link looks on WhatsApp and Social Media
  openGraph: {
    title: "Logic LMS | Dilshan Uthpala",
    description: "Access your Logic class materials and student portal.",
    url: "https://your-logic-site.web.app", // TODO: Update with your actual Firebase URL
    siteName: "Logic LMS",
    images: [
      {
        url: "/logo.png", 
        width: 800,
        height: 600,
        alt: "Logic LMS Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Verification for Search Console
  verification: {
    google: "googlec49a03556e0ad994", // Extracted from your file name
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* Verification meta tag is now handled by the metadata object above */}
      </head>
      <body className={`${inter.className} antialiased selection:bg-teal-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}