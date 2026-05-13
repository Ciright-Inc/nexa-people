import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
