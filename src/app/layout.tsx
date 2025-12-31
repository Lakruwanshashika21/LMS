import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a cleaner, more professional UI
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduPlatform LMS | Quality Education",
  description: "Advanced class management and student portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // "suppressHydrationWarning" prevents errors when switching between Dark/Light mode
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-primary selection:text-white`}>
        {children}
      </body>
    </html>
  );
}