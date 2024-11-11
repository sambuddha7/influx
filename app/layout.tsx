import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Providers } from "./providers";
export const metadata: Metadata = {
  title: "Influx - Digital Marketing for Reddit",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
      >
        <Providers>
        <Navbar />
        {children}
        </Providers>
      </body>
    </html>
  );
}
