import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import "./globals.css";
import { ScrollToTopFab } from "@/components/scroll-to-top-fab";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Nexa People — User Analytics",
  description: "Internal product analytics with geography and people insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans text-[15px] leading-relaxed antialiased">
        {children}
        <ScrollToTopFab />
      </body>
    </html>
  );
}
