import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { InstallPrompt } from "./components/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    statusBarStyle: "black-translucent",
    title: "Logic LMS",
    // startupImage is optional but provides a nice splash screen effect
  },

  // Open Graph: Controls how the link looks on WhatsApp and Social Media
  openGraph: {
    title: "Logic LMS | Dilshan Uthpala",
    description: "Access your Logic class materials and student portal.",
    url: "https://logicwithdilshanuthpala.web.app", // Updated with your verified Firebase URL
    siteName: "Logic LMS",
    images: [
      {
        url: "/logo.png", 
        width: 512,
        height: 512,
        alt: "Logic LMS Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Verification for Search Console
  verification: {
    google: "googlec49a03556e0ad994",
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
        {/* CRITICAL: iOS/Apple specific icons for home screen installation */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo.png" />
        
        {/* PWA primary meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Logic LMS" />
      </head>
      <body className={`${inter.className} antialiased selection:bg-teal-600 selection:text-white overflow-x-hidden`}>
        {children}
        
        {/* This triggers the custom "Install App" popup on supported mobile devices */}
        <InstallPrompt />
      </body>
    </html>
  );
}