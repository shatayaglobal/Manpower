import type React from "react";
import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import ReduxProvider from "@/lib/redux/redux-provider";
import { Toaster } from "sonner";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
  weight: ["400", "600", "700", "900"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ManPower Connect - Connect Workers & Businesses",
  description:
    "Empowering workers and businesses to thrive together through seamless job matching, shift management, and professional networking.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${sourceSans.variable} antialiased`}
    >
      <body className="font-sans">
        <ReduxProvider>
          <Navbar>{children}
            <Toaster position="top-right" duration={3000} theme="light"/>
          </Navbar>
        </ReduxProvider>
      </body>
    </html>
  );
}
