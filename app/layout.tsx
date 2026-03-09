import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vector Network",
  description: "Curated network of builders and early adopters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
