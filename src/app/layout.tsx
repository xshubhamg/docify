import type { Metadata } from "next";
import { IBM_Plex_Sans, Mona_Sans } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { env } from "@/lib/env";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Upload a PDF and hold a live voice conversation grounded in its text, with the source and transcript side by side.";

export const metadata: Metadata = {
  metadataBase: new URL(env.BETTER_AUTH_URL),
  title: "Docify — Voice-first document intelligence",
  description,
  openGraph: {
    type: "website",
    siteName: "Docify",
    title: "Docify — Voice-first document intelligence",
    description,
    url: env.BETTER_AUTH_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Docify — Voice-first document intelligence",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexSans.variable} ${monaSans.variable} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
