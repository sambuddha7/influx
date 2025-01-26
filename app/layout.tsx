import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Influx - Digital Marketing for Reddit",
  description: "",
  icons: {
    icon: "/new_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          type="text/css" 
          rel="stylesheet" 
          href="https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.css" 
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
        </Providers>
      </body>
    </html>
  );
}