import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "NeuraFiT - AI-Powered Personalized Fitness Platform",
  description:
    "Transform your fitness journey with NeuraFiT. Get AI-powered personalized workout plans, custom meal plans, real-time pose feedback, and progress analytics. Join thousands achieving their health goals.",
  keywords: [
    "fitness",
    "AI",
    "workout",
    "meal plan",
    "health",
    "exercise",
    "nutrition",
    "personal trainer",
  ],
  authors: [{ name: "NeuraFiT Team" }],
  openGraph: {
    title: "NeuraFiT - AI-Powered Personalized Fitness Platform",
    description:
      "Transform your fitness journey with AI-powered personalized workouts, nutrition plans, and intelligent insights.",
    type: "website",
    locale: "en_US",
    siteName: "NeuraFiT",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuraFiT - AI-Powered Personalized Fitness Platform",
    description:
      "Transform your fitness journey with AI-powered personalized workouts, nutrition plans, and intelligent insights.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
